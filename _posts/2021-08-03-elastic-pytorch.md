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

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.
