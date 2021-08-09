---
layout: post
title: "PyTorch 弹性分布式训练的设计与实现"
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

机器学习工作负载与传统的在线或者离线的工作负载相比，一个比较显著的特点是重 IO 亦重计算。在之前的文章中介绍过，目前 GPU 的显存已经不足以跟上模型参数规模的发展。随着 Transformer 等新的模型结构的出现，这一问题越来越显著。算法工程师们训练模型所需要的资源越来越多，分布式训练也随之成为了工业界进行模型训练的标准方式。弹性训练能够在训练过程中动态地调整参与训练的实例数量，极大程度提高集群资源的利用率。在 PyTorch 最新发布的 1.9.0 版本中，其原本分布式训练的方式 `torch.distributed.launch` [即将被废弃](https://github.com/pytorch/pytorch/issues/60754)，转而推荐用户使用弹性的分布式训练接口 `torch.distributed.run`。借此机会，我们对这一新特性进行简单地介绍，并且与 Horovod Elastic 进行简单地对比和分析。

## PyTorch 1.9.0 之前的设计

PyTorch 是目前最流行的深度学习框架之一，它最让人称道的是易用性。无论是单机训练还是分布式训练，PyTorch 都提供了简洁的 API。PyTorch 1.9.0 版本之前，分布式训练的方式通常是通过如下的方式进行。

```bash
python -m torch.distributed.launch
        --nnodes=NODE_SIZE
        --nproc_per_node=TRAINERS_PER_NODE
        --node_rank=NODE_RANK
        --master_port=HOST_PORT
        --master_addr=HOST_NODE_ADDR
        YOUR_TRAINING_SCRIPT.py (--arg1 ... train script args...)
```

其中 `nnodes` 是参与训练的节点个数，`nproc_per_node` 是每个节点上运行的进程数量。`node_rank` 是当前节点的标识符，`master_addr` 和 `master_port` 是 master 监听的地址和端口。`torch.distributed.launch` 会设置一些环境变量，其中包括 `WORLD_SIZE` 和 `MASTER_PORT`、`MASTER_ADDR` 等。

随后在当前机器上会创建对应进程进行训练，当前机器会有 `TRAINERS_PER_NODE` 个进程，这些进程组成了一个 local worker group。一共有 `NODE_SIZE` 个机器参与训练，一共有 `NODE_SIZE * TRAINERS_PER_NODE` 个进程。如果想要发起一个分布式训练任务，需要在所有的机器上执行相应的命令。

## PyTorch 1.9.0 中的新设计

在 PyTorch 1.9 中，`torch.distributed.launch` [即将被废弃](https://github.com/pytorch/pytorch/issues/60754)，取而代之的是基于 [pytorch/elastic](https://github.com/pytorch/elastic) 的 `torch.distributed.run`。这一新的方式与之前相比有一些使用上的改动，如下所示。

```bash
python -m torch.distributed.run
        --nnodes=MIN_SIZE:MAX_SIZE
        --nproc_per_node=TRAINERS_PER_NODE
        --rdzv_id=JOB_ID
        --rdzv_backend=c10d
        --rdzv_endpoint=HOST_NODE_ADDR
        YOUR_TRAINING_SCRIPT.py (--arg1 ... train script args...)
```

它提供了一些新的能力：首先是更好的容错，当 worker 失败后会自动重启继续训练；其次是 RANK 和 WORLD_SIZE 这些字段不再需要手动设置。最后也是最重要的，支持弹性训练，动态地增加或减少参与训练的 worker 数量。在上面的例子中，`nnodes` 的设置不再是一个固定的值，而是一个区间。训练任务可以容忍在这一区间范围内的 worker 数量变化。

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

其中比较明显的变化是，用户需要手动地处理 checkpoint。这是因为当 worker 出现失效时，所有的 worker 都会重启，所以需要 checkpoint 机制来保证重启后训练能够继续下去。这一新的分布式训练方式引入不少新的概念，包括 agent、rendezvous 等。接下来我们自用户能接触到的 `torch.distributed.run` 开始，介绍这些新的设计。

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

两者最后都会通过 elastic_launch 发起真正的训练进程。elastic_launch 会通过 elastic agent 来管理 worker 的生命周期，它的返回是每个 worker 的输出。

```python
class elastic_launch:
    ...
    def __call__(self, *args):
        return launch_agent(self._config, self._entrypoint, list(args))

def launch_agent(
    config: LaunchConfig,
    entrypoint: Union[Callable, str, None],
    args: List[Any],
) -> Dict[int, Any]:
    ...
    agent = LocalElasticAgent(
        spec=spec, start_method=config.start_method, log_dir=config.log_dir
    )
    ...
    result = agent.run()
    ...
    return result.return_values
```

elastic agent 是一个独立的进程，负责管理其下的 workers。它起到了类似进程管理系统 supervisor 的作用，会在启动的时候确保每个 worker 的设置正确。由于有关 WORLD_SIZE 和 RANK 的信息不再需要用户提供，elastic agent 会负责处理。除此之外，worker 的失效也是由 elastic agent 负责捕获处理。可以说 elastic agent 是弹性训练中最核心的抽象概念。

<figure>
	<img src="{{ site.url }}/images/elastic-pytorch/agent_diagram.jpeg" height="500" width="500">
    <figcaption>elastic agent</figcaption>
</figure>

上图展示的是 elastic agent 的工作原理。不同的 elastic agent 之间通过 `rendezvous` 进行 worker 之间的相互发现和对成员变动的同步。与此同时，通过对 worker 进程的监控，来捕获训练过程中的失效。其中核心的逻辑都包装在 `LocalElasticAgent.run()` 这一函数调用中。

```python
    def run(self, role: str = DEFAULT_ROLE) -> RunResult:
        ...
        result = self._invoke_run(role)
        return result
    def _invoke_run(self, role: str = DEFAULT_ROLE) -> RunResult:
        ...
        self._initialize_workers(self._worker_group)
        while True:
            ...
            run_result = self._monitor_workers(self._worker_group)
            state = run_result.state
            ...
            if state == WorkerState.SUCCEEDED:
                ...
                return run_result
            elif state in {WorkerState.UNHEALTHY, WorkerState.FAILED}:
                if self._remaining_restarts > 0:
                    ...
                    self._restart_workers(self._worker_group)
                else:
                    ...
                    return run_result
            elif state == WorkerState.HEALTHY:
                ...
                if num_nodes_waiting > 0:
                    ...
                    self._restart_workers(self._worker_group)
            else:
                raise Exception(f"[{role}] Worker group in {state.name} state")
```

可以看到，核心的逻辑在 `_invoke_run` 中。其中 `_initialize_workers` 执行了大部分初始化的工作，其中包括为每个 worker 分配 RANK 等。在默认的实现中 elastic agent 和 workers 进程在同一机器上，因此 `self._monitor_workers(self._worker_group)` 通过 `multiprocessing` 对 workers 的运行状态进行了监控。并且根据不同的状态，进行不同的处理。

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.
