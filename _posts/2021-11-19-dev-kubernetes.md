---
layout: post
title: "在微软帝国中苟且偷生：Kubernetes 上使用 VSCode 进行远程开发的一些探索"
description: 
headline:
modified: 2021-11-19
category: kubernetes
tags: [vscode, kubernetes]
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

VSCode 已经成为了编辑器领域市场占有率第一的产品（参考[WakaTime 2020 Programming Stats](https://visualstudiomagazine.com/articles/2021/01/13/wakatime-vs-code.aspx)），微软的股价也一再突破历史新高，令人侧目。因此不少开发者希望 VSCode 能够像 Jupyter 一样，支持远程开发的能力。虽然目前已经有了 remote-ssh 和 remote-containers 两个插件，能够让用户远程通过 ssh 和 docker 容器进行开发。但是仍然[没有一个插件能够支持 Kubernetes](https://github.com/microsoft/vscode-remote-release/issues/12)。在这篇文章主要介绍了在这一方向的一些探索。事实上一些开源项目或者托管的云上产品都想要解决这一问题，我们的探索也是围绕这些产品和项目展开的。

在进行这些探索之前，让我们先详细地分析一下需求。目前 VSCode 已经具备了通过 ssh 来远程开发的能力，那么为什么还会有用户认为这个能力不够强大呢？首先 remote-ssh 需要用户首先准备好一台运行了 ssh 的机器，同时配置好客户端的 ssh config，让 VSCode 能够找到这台机器的公钥，然后再通过 ssh 远程连接这台机器。而在更多的场景中，我们的期望是远端的机器会在真正被需要的时候创建出来，而在空闲的时候可以被回收掉。而不是时刻占用着硬件资源运行 sshd，等待着 VSCode 的接入。

而实现这一能力，Kubernetes 是最好的载体。在之前，我们可能需要给每一个研发配置一台高性能的 PC 机，或者分配一个虚拟机。而大多数时候，这些机器都是闲置的。如果我们把这些硬件都放到 Kubernetes 里去，随用随申请，那么能够很大程度上提高资源利用率。

换言之，我们期望的是可以自动创建和空闲时销毁的 VSCode 计算资源（如果是在 Kubernetes 上则是对应 Pod）。当用户需要在 VSCode 中运行代码或者在终端中进行操作时，就将对应的计算资源运行起来。在空闲一定时间内，就回收释放。这使得我们能够提高硬件资源的利用率，降低开发过程中的成本。是企业用户非常关心的特性。

说到这里，想必对 VSCode remote 比较熟悉的朋友会建议，是否可以基于 remote-ssh 来修改实现这一特性？起初我也是这样认为的，而且[这个需求](https://github.com/microsoft/vscode-remote-release/issues/12)也是 VSCode remote 用户[投票第二多的需求](https://github.com/microsoft/vscode-remote-release/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3Acontainers)，备受关注。那么社区有没有支持这一特性的计划呢？有但不完全有。

在 remote-containers 0.107.0 版本中，引入了跟 remote-ssh 类似的 attach 到一个 Kubernetes Pod 中的能力。如果你同时安装了 VSCode 的 Kubernetes 扩展和 remote-containers 扩展，那么你可以在 Kubernetes Exploer 页面看到这么一个新的菜单栏 `Attach Visual Studio Code`。

<figure>
	<img src="{{ site.url }}/images/dev-k8s/remote-containers.png" height="500" width="500">
    <figcaption>Attach Visual Studio Code</figcaption>
</figure>

通过它，用户可以 attach 到一个已有的 Pod 上进行开发。但是，我们仍然没有从零开始启动一个新 Pod 和停止一个 Pod 的功能，因此这对提高资源利用率并无帮助。就像这一[回复](https://github.com/microsoft/vscode-remote-release/issues/12#issuecomment-644760901)中提到的那样。对于 remote-ssh 来说，它只是实现了 attach。而我们还需要对应的 start 和 stop 功能。

> Trying to come up with a simple example. You could also run separate script files for each of these:
> 
> ```json
> {
>     "start": "kubectl create deployment --image=nginx nginx-dev ; kubectl wait --for=condition=Available deployment.apps/nginx-dev",
>     "attach": "kubectl exec -i deployment.apps/nginx-dev -- /bin/sh",
>     "rebuild": "kubectl delete deployment nginx-dev",
>     "stop": "kubectl delete deployment nginx-dev"
> }
> ```
> 
> Only "attach" would be mandatory, the other commands would be optional. This configuration would have to be available locally either as user data or checked out from SCM.

那么社区有没有支持这一特性的计划呢？可以理解为没有。

但是非常不幸，VSCode 所有有关 remote 的扩展，都是闭源的。而且没有任何开源或改变[使用许可](https://marketplace.visualstudio.com/items/ms-vscode-remote.remote-containers/license)的计划。

看到这里我并不意外。VSCode 确实是在编辑器领域一路猛进，但是曾经高高挂在微软各种 PR 文章中的 Microsoft ❤️ Open Source 的 Slogan 仿佛又成了空谈。VSCode 的各种语言插件中的 [Language Server](https://microsoft.github.io/language-server-protocol/) 实现再到 VSCode Marketplace，全部是闭源的。VSCode remote 的闭源也符合微软的作风。

然而随着 VSCode 的一路猛进，曾经高高挂在微软各种 PR 文章中的 Microsoft ❤️ Open Source 的 Slogan 仿佛又成了空谈。VSCode 的各种语言插件中的 [Language Server](https://microsoft.github.io/language-server-protocol/) 实现、以及 [VSCode Remote](https://code.visualstudio.com/docs/remote/remote-overview) 特性，再到 VSCode Marketplace，全部是闭源的。

[elastic-jupyter-operator]: https://github.com/tkestack/elastic-jupyter-operator

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.
