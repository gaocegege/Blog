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

Katib 不是第一个超参数搜索的系统，诸如 Optuna、Ray Tune、Google Vizier、HyperOpt 和 NNI 等都是着眼于这一问题的佼佼者。珠玉在前，Katib 与之相比又有哪些独到之处呢？

首先是多租户，Katib 是目前开源的超参数搜索系统里唯一原生支持多租户的。其次是分布式的训练能力，Katib 构建于 Kubeflow 的众多项目之上，能够支持分布式的模型训练与并行的超参数搜索。然后是云原生，Katib 是一个 Kubernetes Native 的系统，所有的功能都依托于 Kubernetes 的扩展性能力实现，是一个云原生的系统。最后，是扩展性，Katib 的架构易于扩展，能够集成不同的超参数搜索算法。

正是因为这些独特的竞争优势，目前 Katib 有来自 20 多家公司的 50 多名贡献者。这篇论文介绍了 Katib 的设计初衷，技术方案和提供的特性，最后有选择地对一些特性进行了实验验证。

## 设计初衷

Katib 从设计之初的定位就是生产可用的自动集群学习系统，为了支持这一目标，Katib 将使用者分为两种角色，一类是用户，一类是管理员。用户群体就是真正使用 Katib 进行超参数搜索的算法工程师，或者数据科学家们。他们会利用 Katib 提供的功能，搜索优秀的超参数，提高模型表现。而管理员，则是负责管理集群资源的基础架构工程师。他们对集群资源的利用率负责，同时也要保证集群上的其他业务不会被超参数搜索业务影响。为了支持多个用户，他们需要 Katib 支持多租户。这两类使用者的需求都是 Katib 关注的重点。

## 细节设计

从设计的角度，Katib 一共有 4 个核心概念。

Experiment（实验），是 Katib 中最高一层的概念，也是面向用户的一个抽象概念。Experiment 代表着一个用户创建的超参数搜索任务，它包含了训练任务的配置定义，搜索的目标，还有搜索空间， 被使用的搜索算法等。

Suggestion（建议）是由 Katib 创建的内部概念。一个 Experiment 会对应一个 Suggestion，Suggestion 是负责提出候选的超参数组合的算法实例。

Trial（尝试）同样是由 Katib 创建的内部概念。在 Experiment 中，用户往往会进行多次的搜索，其中每一次搜索，就会生成一次 Trial。Trial 对应着一个 TrialJob，以及一组由 Suggestion 给出的超参数组合。

TrialJob 同样是内部概念。当 Suggestion 给出参数组合后，对应的 Trial 就会被创建。Trial 只是一个逻辑概念，真正被执行的是 TrialJob。TrialJob 会在填充好超参数取值后，被运行在 Kubernetes 集群中，并且收集训练指标。

这四个核心概念都是以 CRD 的方式存在的。Katib 支持多种 TrialJob 的类型，比如 TFJob，PyTorchJob 等。因此 Katib 支持在单次 Trial 中使用 PyTorch 和 TensorFlow 进行分布式训练。一个示例如图所示：

<figure>
	<img src="{{ site.url }}/images/katib-paper/crd.png" height="500" width="500">
    <figcaption>核心概念</figcaption>
</figure>

一个 Experiment 会创建多个 Trial，每个 Trial 会创建 TrialJob。在这一示例中，TrialJob 的类型是 TFJob（TensorFlow 分布式训练在 Kubernetes 上的 CRD 实现）。而 TFJob 会创建对应的 Parameter Server 还有 Worker，进行分布式的模型训练。

## 系统流程

Katib 的系统工作流程如下图所示。首先用户会创建 Experiment，随后 Katib 会为 Experiment 创建对应的 Suggestion，比如随即搜索算法，贝叶斯优化算法等。在创建好 Suggestion 后，Experiment Controller 会与 Suggestion 交互，获得新的参数组合。Experiment Controller 利用得到的新的参数组合和 Experiment 中训练任务的配置创建出对应的 Trial。Trial Controller 会为 Trial 创建出对应的 TrialJob。在 TrialJob 进行真正的模型训练时，训练指标会被记录下来，指导 Suggestion 更好地提出下一次迭代的候选参数组合。

<figure>
	<img src="{{ site.url }}/images/katib-paper/crd.png" height="500" width="500">
    <figcaption>系统流程</figcaption>
</figure>

对于用户而言，只需要创建好 Experiment 即可，之后的流程都是由 Katib 自动化地完成。

## 竞品特性比较

在文章中，我们对比了 katib 与其他 state-of-art 系统的特性，具体如下所示。

<figure>
	<img src="{{ site.url }}/images/katib-paper/features.png" height="500" width="500">
    <figcaption>特性对比</figcaption>
</figure>

在开源协议方面，除了 Google Vizier 之外，其他的系统都以不同的协议开源。在支持的语言方面，大部分的系统都只提供了 Python SDK。而 Katib 作为云原生的自动机器学习系统，在设计上做到了语言无关，能够支持各种语言。在云原生方面，Katib 的功能以 Kubernetes CRD 的方式对外提供，能够与 Kubernetes 的生态非常好地融合。而其他大部分系统都只是能够运行在 Kubernetes 之上，或者不支持。

在多租户方面，Katib 可以利用 Kubernetes 的 Namespace 和 ResourceQuota 等功能进行简单的租户隔离。同时 Katib 可以控制每个任务的并发程度，每个训练任务的资源限制。而其他大多数系统则不支持这一能力。

在自动扩缩容能力上，Katib 可以配合 Kubernetes Cluster-Autoscaler，自动地在资源不足时扩展集群。同时得益于 Kubeflow 社区的其他项目，Katib 可以在单次搜索任务中运行分布式的训练。

在扩展性方面，Katib 对用户代码几乎没有侵入性，只需要用户将超参数对外以命令行参数的方式暴露出来，即可进行搜索。

在容错方面，Katib 支持定义 Error budgets，允许用户配置搜索任务的最大训练失败次数，保证搜索任务不会因为偶然的训练失败就是停止训练。除此之外，Katib 支持对训练的容错。

Katib 也是与 NNI 一样，支持模型结构搜索的系统。另外 Katib 也可以与 Kubernetes 社区中的 Volcano，Kube-Batch 等调度器项目配合使用，对分布式的训练任务进行 Gang Scheduling。

## 实验验证

针对 Katib 的一些特性，我们进行了实验验证。

<figure>
	<img src="{{ site.url }}/images/katib-paper/multi.png" height="500" width="500">
    <figcaption>多租户</figcaption>
</figure>

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.
