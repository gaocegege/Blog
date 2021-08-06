---
layout: post
title: "分布式弹性训练的实现思路：从 PyTorch 谈起"
description: 
headline:
modified: 2021-08-03
category: 
tags: []
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

机器学习工作负载与传统的在线或者离线的工作负载相比，一个比较显著的特点是重 IO 亦重计算。在之前的文章中介绍过，目前 GPU 的显存已经不足以跟上模型参数规模的发展。随着 Transformer

PyTorch 1.9 之前，分布式训练的方式通常是通过如下的方式进行。

```bash
python -m torch.distributed.launch
        --nnodes=SIZE
        --nproc_per_node=TRAINERS_PER_NODE
        --node_rank=NODE_RANK
        --master_port=HOST_PORT
        --master_addr=HOST_NODE_ADDR
        YOUR_TRAINING_SCRIPT.py (--arg1 ... train script args...)
```

在 PyTorch 1.9 中，`torch.distributed.launch` 被 deprecate 了，取而代之的是基于 [pytorch/elastic](https://github.com/pytorch/elastic) 的 `torch.distributed.run`。这一新的方式与之前相比改动并不大，如下所示。

```bash
python -m torch.distributed.run
        --nnodes=MIN_SIZE:MAX_SIZE
        --nproc_per_node=TRAINERS_PER_NODE
        --rdzv_id=JOB_ID
        --rdzv_backend=c10d
        --rdzv_endpoint=HOST_NODE_ADDR
        YOUR_TRAINING_SCRIPT.py (--arg1 ... train script args...)
```

它提供了一些新的能力：首先是更好的容错，当 Worker 失败后会自动重启继续训练；其次是 RANK 和 WORLD_SIZE 这些字段不再需要手动设置。最后也是最重要的，支持弹性训练，动态地增加或减少参与训练的 Worker 数量。在上面的例子中，`nnodes` 的设置不再是一个固定的值，而是一个区间。训练任务可以容忍在这一区间范围内的 Worker 数量变化。

如果要支持弹性能力，训练代码也需要进行一些修改。

```python
def main():
     args = parse_args(sys.argv[1:])
     state = load_checkpoint(args.checkpoint_path)
     initialize(state)

     # torch.distributed.run ensure that this will work
     # by exporting all the env vars needed to initialize the process group
     torch.distributed.init_process_group(backend=args.backend)

     for i in range(state.epoch, state.total_num_epochs)
          for batch in iter(state.dataset)
              train(batch, state.model)

          state.epoch += 1
          save_checkpoint(state)
```

其中比较明显的变化是，用户需要手动地处理 checkpoint。这是因为当 Worker 出现失效时，所有的 Worker 都会重启，所以需要 Checkpoint 机制来保证重启后训练能够继续下去。

## 设计与实现

这一新的分布式训练方式引入不少新的概念，包括 Agent、Rendezvous 等。接下来我们自用户能接触到的 `torch.distributed.run` 开始，介绍这些新的设计。

```python
def run(args):
    if args.standalone:
        args.rdzv_backend = "c10d"
        args.rdzv_endpoint = "localhost:29400"
        args.rdzv_id = str(uuid.uuid4())
        log.info(
            f"\n**************************************\n"
            f"Rendezvous info:\n"
            f"--rdzv_backend={args.rdzv_backend} "
            f"--rdzv_endpoint={args.rdzv_endpoint} "
            f"--rdzv_id={args.rdzv_id}\n"
            f"**************************************\n"
        )

    config, cmd, cmd_args = config_from_args(args)
    elastic_launch(
        config=config,
        entrypoint=cmd,
    )(*cmd_args)
```

其中主要区分了两个模式，Standalone 模式和分布式模式。Standalone 模式是分布式模式的一种特例，它主要针对单机多 Worker 的方式提供了一些便利的设置，不再需要设置一些多余的参数如 `rdzv_backend` 和 `rdzv_endpoint` 等。

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.
