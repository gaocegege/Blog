---
layout: post
title: "在 Microsoft 的“邪恶帝国”中苟且偷生：如何通过 VSCode 在 Kubernetes 上支持远程开发"
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

VSCode 已经成为了编辑器领域市场占有率第一的产品（参考[WakaTime 2020 Programming Stats](https://visualstudiomagazine.com/articles/2021/01/13/wakatime-vs-code.aspx)）。微软又重新耍起了之前的套路，尽管 VSCode 是开源的，但是它的很多扩展功能都是闭源的。比如，被开发者广泛使用的 VSCode Remote。

关注到这一点，是在设计和开发 [elastic-jupyter-operator][] 的过程中。[elastic-jupyter-operator][] 是帮助用户在 Kubernetes 上运行 Jupyter Notebook 的一个扩展，它能够将 Jupyter Notebook 以弹性地方式运行在集群上，在空闲时会将 Kernel 关闭回收，以释放 GPU 资源，提高资源利用率。

在向用户推广时，有一个

[elastic-jupyter-operator]: https://github.com/tkestack/elastic-jupyter-operator

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.
