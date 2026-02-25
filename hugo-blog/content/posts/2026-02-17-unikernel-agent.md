---
title: "Agent sandbox 可能的选型以及 unikernel 的机会"
headline:
modified: 2026-02-17
categories:
  - genai
tags:
  - genai
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

最近放假，研究 agent 上瘾。[刚刚体验了 agent rl](https://gaocegege.com/Blog/jiucai-rl)，就又在看 agent sandbox 方案时，一个问题反复浮现：既然 agent 要的是轻量、安全、快速启动，为什么没人用 unikernel？在 2017 年的时候我写过一篇文章介绍过 unikernel：[Unikernel：从不入门到入门](https://gaocegege.com/Blog/%E5%AE%89%E5%88%A9/unikernel-book)。还在读书时候我就一直觉得它是非常有趣的技术，可惜一直没有真正被业界广泛采用过。

从理论上看，这简直是天作之合。unikernel 将应用和内核编译成一个单一的、运行在硬件虚拟化之上的镜像——没有多余的 shell，没有无用的系统调用，攻击面小到极致，启动快到毫秒级。对于运行不可信代码的 Agent 沙箱来说，还有比这更理想的基础吗？

然而，现实是不仅没人用，甚至很少有人讨论它。当行业在为 agent 寻找安全底座时，我们看到的是 firecracker、gvisor、kata containers，可能再带上 wasm。

在讲这个问题之前，先让我们简单统一一下 agent sandbox 的需求。agent sandbox 需要满足以下几个核心需求。首先是冷启动时间要快，理想情况下在 100ms 以内。其次是安全性要高，能够有效隔离不可信代码，防止越权访问和攻击。第三是要能支持 python 这种主流的 agent 开发语言，能够兼容常见的 python 库和工具。第四是要有一个方便的镜像构建流程，能够让用户快速构建和部署自己的 agent 镜像。

## e2b (firecracker)

先来看看用的最多的两个思路，容器和 firecracker。我觉得很多人会误会容器的启动时间不如 firecracker 之类的轻量级虚拟机快，比如我在研究 sandbox 时候看到的[知乎上的一篇文章](https://zhuanlan.zhihu.com/p/1999938129465979624)。可能是因为用容器的时候我们跑 `docker run`，体感启动时间很漫长。但排除掉镜像拉取需要的诸多操作，容器启动做的事情非常简单，基本就是

- 镜像解压与层合并：overlay2 存储驱动将只读层与可写层合并 
- 容器创建：runc 创建命名空间、cgroups、网络
- 进程启动：执行 ENTRYPOINT/CMD

这个启动的时间在 50ms 以下，甚至可以做到 10ms 级别。相比之下，firecracker 之类的轻量级虚拟机虽然也很快，但通常在 125ms 以上。还有很多比较是拿容器里的进程就绪的时间和一个空的 micro vm 的启动时间来比较的，这样的比较也是不公平的。容器的启动时间完全可以满足 agent sandbox 的需求了。它问题更多来自于安全性。虽然容器通过命名空间和 cgroups 提供了一定程度的隔离，但它们仍然共享宿主机的内核。

firecracker 之类的轻量级虚拟机则提供了更强的隔离，因为它们运行在完全独立的内核上，攻击面更小，更适合运行不可信代码的场景。我们可以拿 e2b 作为一个例子来看看它是如何利用 firecracker 来构建 agent sandbox 的。

[e2b](https://github.com/e2b-dev/e2b) 是最近比较火的一个 agent sandbox 方案，它的设计目标是为 agent 提供一个轻量级、安全的运行环境，支持快速启动和高密度部署。我们来看看它是怎么构建 sandbox 的。

在 e2b 里，sandbox 的镜像被称作 template：

> Snapshots are saved running sandboxes. We serialize and save the whole sandbox’s filesystem together with all the running processes in a way that can be loaded later.
> This allows us to load the sandbox in a few hundred milliseconds any time later with all the processes already running and the filesystem exactly as it was.

因为 e2b 是用 firecracker 来实现 sandbox 的，所以它的 template 就是一个完整的 Linux 镜像。而 e2b 给到用户的构建语言又是 Dockerfile 的一个子集，它是把一个 docker 的文件系统 extract 成了 ext4 rootfs，实现藏的比较深，在 [e2b-dev/infra](https://github.com/e2b-dev/infra/blob/main/packages/orchestrator/internal/template/build/builder.go#L101) 下，大概流程是：

- 拉取基础镜像：从远程仓库获取指定的 Docker 镜像
- 注入配置层：添加新的文件层，包含主机名、DNS、Envd 服务配置以及基础预置脚本（该脚本会在大部分 VM 服务启动前运行）
- 提取文件系统：从镜像中提取 ext4 格式的根文件系统，这个过程类似 [buildfs](https://github.com/rust-firecracker/buildfs/) 的实现
- 初次启动（预置阶段）：启动 Firecracker 微虚拟机，运行仅包含预置脚本的 BusyBox init 进程。此步骤会安装 systemd（用于后续正式的 VM 启动），等待脚本执行完成后退出
- 二次启动（服务初始化）：再次启动 Firecracker 虚拟机（这次使用 systemd），等待 Envd 服务就绪
- 构建模板层：生成模板所需的各个层/步骤
- 沙箱内收尾配置：重启沙箱环境，执行两个额外的命令：
  - 配置脚本：启用 swap、创建用户、修改文件夹权限等
  - 启动命令（如果定义了）以及就绪命令（未定义时使用默认值）
- 创建快照：对配置完成的系统进行快照
- 上传模板：将模板及所有尚未上传的层上传到存储系统

通过这样的方式，e2b 实现了一个基于 firecracker 的 agent sandbox。它是如何在一个集群上调度这些 sandbox 的呢？它的调度系统叫做 orchestrator，负责管理 sandbox 的生命周期，包括创建、销毁、监控等。

很多人可能看到 e2b 代码里的 nomad 就会觉得它是基于 nomad 来做调度的，但实际上它并没有直接使用 nomad 的调度功能，而是自己实现了一个非常简单的调度器，来管理 sandbox 的生命周期。nomad 只用来管理 e2b 控制平面的部署和扩展。

e2b 调度 sandbox 的过程非常简单，是基于 [best of k](https://github.com/e2b-dev/infra/blob/d79e4ca97205d304d8116a78d8f4d485bc644cfe/packages/api/internal/orchestrator/placement/placement_best_of_K.go#L106) 的算法。当需要创建一个 sandbox 的时候，orchestrator 会从集群里随机选取 k 个节点，然后在这 k 个节点上基于预设 heuristic（如已用 CPU、内存、在起沙箱数等）计算一个 score，越低越好（负载最小化），最后选取 score 最低的那个节点来创建 sandbox。这个算法虽然适合沙箱高并发生命周期短的 agent 场景，调度效率也很高，但是应该还有很大优化的空间。

这里引申出来一个我的观点，我一直觉得 Kubernetes 并不适合 agent sandbox 的调度。Kubernetes 适合长期运行的服务，或者说生命周期比较长的工作负载。agent sandbox 的生命周期非常短。而且 Kubernetes 太重了，agent 很多情况下需要在本地运行，或者说在一个非常小的集群里运行，又或者需要在本地和 cloud 之间无缝迁移，互相配合。e2b 这种自己实现一个轻量级的调度器，来管理 sandbox 的生命周期，也是一种不错的选择。

当然作为 infra 哥，时时刻刻想着能不能把其中的共性抽象成一个通用的调度系统，来支持不同的 sandbox 方案。可能最下面的 data plane 的预设是 containerd-based 的 sandbox runtime，比如 containerd-firecracker。调度上可以做的 tradeoff 很多。这个跟这篇文章的主题关系不大，就不展开了。

除了启动快之外，firecracker 还带来了 snapshot 的能力，可以 <1s（之前文档里的数据是 intel <8ms, amd <3ms）的时间来 resume 一个已经运行好的 sandbox，这对于 agent 来说是非常有吸引力的。因为 agent 的生命周期短，频繁的创建和销毁会带来不小的性能开销，而 snapshot 能够大大减少这个开销。

```python
from e2b_code_interpreter import Sandbox

sbx = Sandbox.create()
print('Sandbox created', sbx.sandbox_id)

# Pause the sandbox
# You can save the sandbox ID in your database to resume the sandbox later
sbx.beta_pause()
print('Sandbox paused', sbx.sandbox_id)

# Connect to the sandbox (it will automatically resume the sandbox, if paused)
same_sbx = sbx.connect()
print('Connected to the sandbox', same_sbx.sandbox_id)
```

## k7（kata）

看完 e2b 基于自己维护的 docker image 转 kernel image 用 firecracker 和自己的 orchestrator 来管理 sandbox 的方案，再来看一个基于 kata 的实现 [k7](https://github.com/Katakate/k7)。国内也有很多大厂的 agent sandbox 方案也是基于 kata 来实现的，我们可以把 k7 作为一个代表来分享一下观点。

k7 的 vmm 也是 firecracker，没有用 cloud hypervisor。由于 kata 是支持兼容 OCI 标准的容器镜像的，所以 k7 的 template 就是一个普通的 docker 镜像了。kata 跟 Kubernetes 的相性非常好，k7 直接使用了 Kubernetes(or k3s) 来做调度。

整体因为采用了成熟的组件，k7 的实现相对简单了很多。它的 sandbox 镜像构建流程也非常简单，基本上就是基于 dockerfile 来构建一个 docker 镜像，然后直接用这个镜像来启动 sandbox 就好了。相比 e2b 那种需要把 docker 镜像 extract 成 ext4 rootfs 的方式，k7 的方式要简单很多了。

```python
from katakate import Client

k7 = Client(
  endpoint='https://<your-endpoint>', 
  api_key='your-key')

# Create sandbox
sb = k7.create({
    "name": "my-sandbox",
    "image": "alpine:latest"
})

# Execute code
result = sb.exec('echo "Hello World"')
print(result['stdout'])

# List all sandboxes
sandboxes = k7.list()

# Delete sandbox
sb.delete()
```

但是它应该无法像 e2b 那样利用 firecracker 的 snapshot 来实现快速的 resume 了。kata 的设计是为了兼容容器，它应该是屏蔽了 firecracker 的 resume 功能，而且 kata 的实现是 VM 里跑了一个 container，我也不确定直接用 firecracker snapshot 是不是能取得预期的效果和延迟。有 kata 的朋友可以分享一下。

在我自己看来，resume 的能力是不是 agent sandbox 需要的核心能力，可能还要打个问号。对于一些简单的 agent 场景，可能并不需要 snapshot 的能力。而 kata 带来的完全兼容 OCI 镜像的能力，可能对于很多用户来说更有吸引力了。毕竟构建一个 docker 镜像要比构建一个 firecracker 的 template 要简单很多了，速度也快得多。e2b 的实现是用构建时间来换 micro vm 的启动时间和 snapshot resume 的便捷。

## monty（wasm）

看完 vm 的方案，再来看看 wasm 有没有什么好设计。wasm 能够比容器冷启动还要快，前面提到容器的启动时间在 50ms，中间要配置 cgroups，命名空间等等，而 wasm 的启动时间在 10ms 级别，它直接在运行时内实例化，没有内核加载、设备初始化等开销。

但是 wasm 支持 python 是非常麻烦的，首先 wasm 的假设是单一线性的内存空间，而 python 的内存管理依赖 gc，还挺复杂（我不懂）。其次跟 unikernel 比较像的一点是 wasm 通过 WASI 访问系统，WASI 是一个精简、可移植的接口层，功能远少于 Linux 原生接口。python 高度依赖各种系统调用和库函数，WASI 的限制会导致很多 python 库无法正常工作。

Pyodide 是一个将 CPython 解释器和科学计算生态的一些项目编译到 WebAssembly 的项目，但它的冷启动特别慢，因为需要编译整个 CPython 解释器和相关库到 wasm，这个过程非常耗时。目前优化的比较好的思路是[ Cloudflare 的思路](https://developers.cloudflare.com/workers/languages/python/how-python-workers-work/)，它通过 snapshot 把运行时的耗时挪到了部署时。

wasmer 也做过一些优化，也是通过类似于快照和缓存的思路。但是这些在我看来都是治标不治本的方案。wasm 的设计初衷并不是为了支持像 python 这样复杂的动态语言的，所以它在设计上就有一些限制。

比较值得一提的是 [monty](https://github.com/pydantic/monty)。它是一个支持 python 部分子集的解释器。跟一些常见的技术对比如图所示。

<figure>
	<img src="/Blog/images/unikernel-agent/table.png" alt="Monty 对比" height="500" width="700">
    <figcaption>Monty 对比</figcaption>
</figure>

0.06ms 的启动时间远远快于容器和 firecracker 之类的方案了。其中 starlark 也是一个 python 的方言，是 bazel 用来作为构建语言提出的一个子集语言。在我们曾经的项目 [envd](https://github.com/tensorchord/envd) 里也有用过 starlark 作为构建语言。这个支持的语法非常有限，虽然冷启动快但是没有参考性。

其中提到的 wasmer 虽然快，但是本身我还是觉得不值得考虑，原因前面有提到，再加上本身项目不怎么维护了。其中的 sandboxing service 举例提到了 e2b，daytona 和 modal。这三个其实技术完全不一样，这部分测试也比较随意，不具备参考性。YOLO python 就是直接本地跑 python 解释器了，虽然启动时间快，但是安全性完全没有保障。

看上去 monty 是一个不错的方案，但是它支持的语法子集太小，`class` 不支持，`sys` 等模块也不支持，这样的阉割下，unikernel 反而感觉更有优势。

## unikernel

看完这些项目的设计，我们再回到最开始的问题，为什么没人用 unikernel 来做 agent sandbox 呢？一个挺重要的原因我认为是之前的 unikernel 是不支持多进程的。传统意义上的 unikernel 没有内核和用户态的概念，应用与内核编译为一体，它也是单地址空间，没有多进程的概念。如果没有多进程的概念，python 这种语言就没法很好的支持，因为它重度依赖多进程模型。

unikraft 在去年五月[ 0.19 版本支持了多进程](https://unikraft.org/blog/2025-05-15-multiprocess?trk=public_post_comment-text)，这对支持 python 来说是一个非常重要的特性，但它实现的方式是 `vfork` 后子进程与父进程共享地址空间，如果子进程不立刻 `execve` 的话，父子进程访问内存就会互相干扰。虽然 unikraft 的实现是为了兼容一些需要多进程的应用，但它并不是真正意义上的多进程。

还有的探索是 [Unikernel Linux (UKL)](https://ar5iv.labs.arxiv.org/html/2206.00789)。UKL 采取了一个非常不同的思路，它不是从零开始设计 unikernel，而是通过配置选项将 unikernel 优化技术集成到 Linux 中。在 UKL 中，单个应用可以直接链接到 Linux 内核，在 supervisor 权限下运行，无需修改应用源代码，只需重新编译并与修改过的 Linux 内核和 glibc 联接。

UKL 的基础模型保留了 Linux 的大部分设计，包括应用和内核的分离地址空间、不同的执行模式、以及多进程支持的能力。这样做的好处是未修改的应用可以开箱即用地运行。但是 UKL 失去了 unikernel 的一些核心优势，比如极小的攻击面和极快的启动时间。

但另外一个角度，我们不能只看到启动时间，事实上构建和 image 分发的效率也是非常重要的。docker 之所以能够成为主流的虚拟化技术，镜像分发的方便和高效是一个非常重要的因素。unikernel 能够做到非常小的镜像大小，是非常有竞争力的。如果能够在多进程与小镜像之间做一个好的取舍，我还是认为 unikernel 是非常有潜力的。

## modal

讲到这里，我们再讲一个在镜像上做了非常扎实工作的产品 modal。他们之前在 Youtube 上有一个专门讲加速的视频 [Fast, lazy container loading in modal.com by Jonathon Belotti](https://www.youtube.com/watch?v=SlkEW4C2kd4)。实际上镜像带来的启动时间开销是远大于启动本身的，这才是延迟最大的单一来源。

传统的 docker 拉取镜像，是串行完成下载 N 个 gzip 压缩层（速度约 2 GiB/s）、单线程解压（80 MiB/s）、解包到文件系统这一整套流程。对于一个 8GB 的镜像，这个过程可能需要一分钟。整个容器在数据完全就绪前，无法启动。

modal 采取了 lazy loading 的方式，换句话说就是按需加载。当你运行一个 pytorch 进程的时候，你可能不会访问容器文件系统里的所有文件。这个思路跟 [dragonfly](https://github.com/dragonflydb/dragonfly) / estargz 之类的分层镜像格式是类似的，但是 modal 的实现不太一样，是通过 fuse 来实现的，我猜测应该是用 fuse 拦截文件系统的读取，在创建容器文件系统的时候，根据镜像的元数据，先生成一个占位的文件系统树，然后在被访问的时候按照内存，本地 SSD，同可用区缓存服务器，区域 CDN，对象存储的优先级顺序，去请求数据。

视频里还提到很多 fuse 的性能调优，感兴趣可以自己去看看。modal 的这个设计确实非常巧妙，能够大大减少镜像拉取的时间，提升容器的启动速度。

## 结

agent sandbox 的设计有很多不同的方案，每种方案都有自己的优缺点。firecracker 提供了强隔离和 snapshot 能力，但构建镜像比较麻烦；kata 提供了兼容 OCI 镜像的能力，但可能无法利用 firecracker 的 snapshot；wasm 启动快但支持 python 很麻烦；unikernel 理论上非常适合 agent sandbox，但之前不支持多进程是一个很大的限制。未来随着 unikernel 技术的发展，可能会有更多的机会来支持 agent sandbox 的需求。

但是不得不说，镜像构建和分发的效率也很重要。当然这个对于 modal 会运行 LLM 推理服务的产品来说更加重要，因为 LLM 的镜像和模型都很大。而 agent 可能没有那么夸张。

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.