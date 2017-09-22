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

Kubernetes 是一个由 Google 捐赠给 [CNCF](https://www.cncf.io/) 的一个容器编排框架，也是目前应用最为广泛的编排框架之一。这篇文章是对 Kubernetes 中有关调度方面的介绍。

## 调度过程

在读代码之前，先对 Kubernetes 整体的调度过程做一个简单的介绍。

<figure>
	<img src="{{ site.url }}/images/kubernetes/initial-state.png" alt="State" height="500" width="500">
	<figcaption>Machine</figcaption>
</figure>

本文就到此为止，系列下一篇应该是对 [Nomad](https://www.nomadproject.io/) 的介绍，大概应该就是在最近吧。

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.
