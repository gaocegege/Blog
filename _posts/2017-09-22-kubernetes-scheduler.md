---
layout: post
title: "浅入了解容器编排框架调度器之 Kubernetes"
description: 
headline:
modified: 2017-09-22
category: 源码分析
tags: []
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

Kubernetes 是由 Google 捐赠给 [CNCF](https://www.cncf.io/) 的一个容器编排框架，也是目前应用最为广泛的编排框架之一。这篇文章是对 Kubernetes 1.8 中的 Scheduler（以下称为 kube-scheduler）的介绍，如果要阅读本文，需要对 Kubernetes 的基本概念如 pod, node 等有所了解。

## 调度过程

在读代码之前，先对 Kubernetes 整体的调度过程做一个简单的介绍。如果你对 Kubernetes 的调度过程已经熟悉的话，可略过不读。

Kubernetes 的调度的目的是把一个 pod 放在它最合适的 node 上去运行，所以调度的过程可以被理解为找一个 node，把 pod 放上去的过程。整个过程可以类比为喜闻乐见的相亲活动，pod 是相亲者，node 是所有可选的相亲对象，而 kube-scheduler 就像是相亲网站，它会负责根据相亲者的要求，找到与其要求最接近的相亲对象。当然这里也有一些不同点，比如每个 node 可以运行多个 pod，但是相亲者与相亲对象绑定以后应该是不能再跟别人进行喜闻乐见的相亲活动了/w\

出于性能，可扩展性以及其他各个方面的考虑，Kubernetes 的调度分为两个过程，第一个过程叫做 Predicates，第二个过程叫做 Priorities。

在 Predicates 过程中，kube-scheduler 会先执行一系列被称为 predicate 的函数，过滤掉不符合硬性条件的 node。这个环节可以对应相亲活动中的硬条件过滤，比如你想找一个程序员，那相亲网站会帮你过滤掉所有不是程序员的选择。而所有通过了 Predicates 过程的 node，都会进入下一个过程。

在 Priorities 过程中，kube-scheduler 会将所有通过 Predicates 过程的 node 根据自己的标准打分，然后从中选择一个得分最高的 node，将其与 pod 绑定在一起，即在该 node 上运行此 pod。这就好比，相亲网站过滤好了潜在的相亲对象，会再帮你对他们做一个打分，然后推荐给你一个条件最好的给你。（不要问我为什么这么熟练）

<figure>
	<img src="{{ site.url }}/images/kubernetes/initial-state.png" alt="State" height="500" width="500">
</figure>

文字性的叙述过于单调，这里用图来说明这个过程。在图中一共有 16 台服务器，有着不同的配置。

<figure>
	<img src="{{ site.url }}/images/kubernetes/algorithm.png" alt="State" height="500" width="500">
</figure>

经过了两个 predicate 后，过滤掉了不满足条件的 node，剩下的 node 都足以运行 pod，这时候就需要 Priorities 过程来找到最适合的那个 node。经过两轮 priority 后，发现了一个最适合的 node，于是 pod 和 node 终于在一起了。在绝大多数情况下，调度就结束了。

这里特此说明，这些图只是为了说明调度的过程，Kubernetes 支持的 predicate 和 priority 的维度并不是 CPU 和 Memory。

## 代码编译

编译 kube-scheduler 只需要运行 

```bash
make all WHAT=plugin/cmd/kube-scheduler
```

就可以了，编译后的结果会被放置在 `${KUBERNETES_PATH}/_output/bin/` 下。

## 浅入理解

接下来就进入了最激动人心的代码阅读部分。kube-scheduler 的入口是在 [`plugin/cmd/kube-scheduler/scheduler.go`](https://github.com/kubernetes/kubernetes/blob/release-1.8/plugin/cmd/kube-scheduler/scheduler.go) 中，因此如果要阅读调度的代码，从这里开始就可以了。

不过 `main` 函数只是告诉你他是怎么启动的，真正的逻辑是从 [`plugin/cmd/kube-scheduler/app/server.go#L68`](https://github.com/kubernetes/kubernetes/blob/release-1.8/plugin/cmd/kube-scheduler/app/server.go#L68) 开始的。在 `Run` 函数中，首先创建了一个 Kuberntes Clientset，这可以理解为是 kube-scheduler 跟 Kubernetes 进行交互的 client，通过它可以拿到集群上 node，pod 等等的信息。然后根据这个 client 创建出对 node 和 pod 等等资源的 informer，这里用了一点点的 trick，来规避 import cycle。以 node informer 的逻辑为例，其创建的逻辑在 [staging/src/k8s.io/client-go/informers/core/v1/node.go#L47](https://github.com/kubernetes/kubernetes/blob/release-1.8/staging/src/k8s.io/client-go/informers/core/v1/node.go#L47)。Informer 有点像是观察者模式的样子，会 watch 一种资源的变化，这里水很深，代码挺复杂的，好奇的话建议仔细看看。在创建 kube-scheduler 的过程中，几乎所有的 informer（除了 pod informer），都是通过一个 factory 来做的，这样可以防止频繁地创建。之后就是 scheduler 去获取 leader 的地位，然后执行 [plugin/pkg/scheduler/scheduler.go#L159](https://github.com/kubernetes/kubernetes/blob/release-1.8/plugin/pkg/scheduler/scheduler.go#L159) 中的 run 函数，真真正正地开始提供相亲服务了。



本文就到此为止，系列下一篇应该是对 [Nomad](https://www.nomadproject.io/) 的介绍，大概应该就是在最近吧。

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.
