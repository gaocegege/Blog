---
layout: post
title: "云原生的自动机器学习系统 Katib 论文解读"
description: 
headline:
modified: 2020-06-07
category: kubernetes
tags: []
imagefeature: /katib-paper/cover.png
mathjax: false
chart:
comments: true
featured: true
---

2020 年 6 月份，来自思科、才云科技、谷歌、IBM、蚂蚁金服等公司的作者共同完成的论文 [A Scalable and Cloud-Native Hyperparameter Tuning System](https://arxiv.org/abs/2006.02085) 发布。论文主要介绍了 Katib，一个云原生的自动机器学习系统。Katib 在才云科技和蚂蚁金服的环境中已经得以采用，通过 Kubernetes 原生的 API，Katib 可以帮助用户快捷地创建超参数搜索任务。这一文章主要介绍了 Katib 论文中的主要内容，在最后会与您分享 Kubeflow Katib 在 2020 年的版本更新计划。

## 引子

如今，机器学习技术和算法几乎应用于每个领域。而建立一个高质量的机器学习模型是一个迭代的、复杂的、耗时的过程，除了要有一个有效调整超参数的良好经验外，还需要尝试不同的算法和技术。有效地进行这个过程需要扎实的知识和经验。随着数据量的持续和巨大增长，人们已经认识到，有知识的数据科学家的数量无法扩大到足以解决这些难题。因此，将建立良好机器学习模型的过程自动化是至关重要的。在 Katib 的论文中，我们主要阐述了 Katib 的超参数搜索功能的设计与实现。

超参数，指的是在模型训练任务执行之前，需要被指定的参数。在进行模型训练时，超参数的值在训练过程中不会被改变，而超参数的取值又能在一定程度上影响模型的性能表现。利用自动化的方式确定一组较优的模型超参数，是超参数搜索的目标。

Katib 不是第一个超参数搜索的系统，诸如 Optuna、Ray Tune、Google Vizier、HyperOpt 和 NNI 等都是着眼于这一问题的前辈。珠玉在前，Katib 与之相比又有哪些独到之处呢？

首先是多租户，Katib 是目前开源的超参数搜索系统里唯一原生支持多租户的。其次是分布式的训练能力，Katib 构建于 Kubeflow 的众多项目之上，能够支持分布式的模型训练与并行的超参数搜索。然后是云原生，Katib 是一个 Kubernetes Native 的系统，所有的功能都依托于 Kubernetes 的扩展性能力实现，是一个云原生的系统。最后，是扩展性，Katib 的架构易于扩展，能够集成不同的超参数搜索算法。

正是因为这些独特的竞争优势，目前 Katib 有来自 20 多家公司的 50 多名贡献者。这篇论文介绍了 Katib 的设计初衷，技术方案和提供的特性，最后有选择地对一些特性进行了实验验证。

## 设计初衷

Katib 从设计之初的定位就是生产可用的自动集群学习系统，为了支持这一目标，Katib 将使用者分为两种角色，一类是用户，一类是管理员。用户群体就是真正使用 Katib 进行超参数搜索的算法工程师，或者数据科学家们。他们会利用 Katib 提供的功能，搜索优秀的超参数，提高模型表现。而管理员，则是负责管理集群资源的基础架构工程师。他们对集群资源的利用率负责，同时也要保证集群上的其他业务不会被超参数搜索业务影响。为了支持多个用户，他们需要 Katib 支持多租户。这两类使用者的需求都是 Katib 关注的重点。

## 细节设计

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.
