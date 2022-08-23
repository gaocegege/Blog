---
layout: post
title: "TensorChord Tea Hour 技术分享: Buildkit Internals"
description: 
headline:
modified: 2022-08-23
category: kubernetes
tags: [kubernetes]
imagefeature:
mathjax: false
chart:
comments: true
featured: false
---

Buildkit 是 `docker build` 背后的顶梁柱，当我们在利用 docker 构建镜像时，背后就是 buildkit 的功劳。所以大家可能都是 Buildkit 的用户，尽管它的光芒大部分都被 docker 所隐藏。[tensorchord/envd](https://github.com/tensorchord/envd) 也是基于 buildkit 来实现的，为算法工程师和 AI 基础设施团队提供镜像和开发环境构建的新选择。

<figure>
	<img src="{{ site.url }}/images/envd/readme.png" height="800" width="800">
    <figcaption>envd README</figcaption>
</figure>

除此之外，还有一些传统基础设施领域的新项目如 [dagger](https://github.com/dagger/dagger)、[earthly](https://github.com/earthly/earthly)、[acorn](https://github.com/acorn-io/acorn) 等也都是基于 buildkit 设计的。buildkit 正在各个领域默默地发光发热，堪称容器领域的扫地僧项目。

[之前的文章中](http://gaocegege.com/Blog/kubernetes/buildkit)，我们介绍了 buildkit 支持的特性与功能。在北京时间 8 月 26 日的 16:00，我们将在 TensorChord Tea Hour 上分享 buildkit 的更多设计与实现细节。分享的 slides 也[公开放送](https://docs.google.com/presentation/d/1Z8JLeNbH_pDWwO7JsOUNAgZtULxur99eMCLIyLGCTYk/edit?usp=sharing)。

<figure>
	<img src="{{ site.url }}/images/buildkit/slides.png" height="800" width="800">
    <figcaption>Slides</figcaption>
</figure>

TensorChord Tea Hour 是 [TensorChord](https://github.com/tensorchord) 每月一次的技术分享系列。每个月的最后一个星期五，我们会围绕深度学习、容器、集群调度等相关领域的话题进行分享或是讨论。感兴趣可以订阅[谷歌日历](https://calendar.google.com/calendar/u/0?cid=c2FwYmU3NWtlNm0xbHVpbWVsa2k4djZsN29AZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ)长期关注。

最后放出 Tea Hour 的腾讯会议链接：[TensorChord Tea Hour: Buildkit Internals](https://meeting.tencent.com/dm/KGutoKxhXm05)。作为 Tea Hour，分享的形式比较随意。欢迎大家更多地参与，分享时也可随时打断提出问题。成为真正的 Tea Hour（三点几了，饮茶先啦）而不是 yet another 枯燥的技术分享。

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.
