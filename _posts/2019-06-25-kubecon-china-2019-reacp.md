---
layout: post
title: "KubeCon China 2019 Recap"
description: 
headline:
modified: 2019-06-25
category: 
tags: []
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

KubeCon China 2019 于北京时间 2019 年 6 月 24 号到 26 号在中国上海举办。Linus 也来到了上海，在会议上进行了一次座谈会，上次 [LinuxCon](http://gaocegege.com/Blog/%E9%9A%8F%E7%AC%94/linuxcon) 的时候也是类似的形式，似乎 Linus 对座谈会的形式更加喜爱。

KubeCon China 2019 有很多干货满满的分享，这里针对其中的一些个人比较感兴趣的 Talk 做一些梳理。

### [使用 Kubeflow 进行超参数调优 - Richard Liu，Google；Johnu George, Cisco](https://kccncosschn19chi.sched.com/event/NrZi/zhi-kubeflow-mao-chan-yun-hoy-richard-liudaelsgoogledaehjohnu-george-cisco?iframe=no&w=100%&sidebar=yes&bg=no)

这一 Talk 是 Google 的高级工程师 Richard Liu 以及思科的技术 Lead Johnu 一起分享的。他们主要介绍了 Kubeflow 社区中的一个开源项目 [katib][]。这一项目是由 Caicloud，Cisco，Google，IBM 和 NTT Japan 的贡献者一起维护的，Kubernetes Native 的 AutoML 系统。其 Slides 可以在[此处](https://static.sched.com/hosted_files/kccncosschn19chi/9d/Hyperparameter%20Tuning%20in%20Kubeflow.pdf)观看。

这一系统是利用 Kubernetes CustomResourceDefinition 这一特性，实现了一组 CRD。通过这一组 CRD 以及 Kubeflow 社区中的其他支持性的 CRD（如 TFJob，PyTorchJob 等）配合，可以支持用户在 Kubernetes 上并行地进行超参数训练（Hyperparameter Tuning）以及模型结构搜索（Neural Architecture Search）。相比于其他的自动机器学习系统，katib 受 Google Vizier 启发，基于 Kubernetes 构建，从架构上支持大规模并行的搜索任务。目前这一系统也仍在积极地开发中，后续维护团队会加强其稳定性和扩展性，支持不同的数据库存储后端，以及更多高级的 AutoML 功能（如自动模型压缩，基于梯度下降的神经网络结构搜索算法等）。

### [Knative Serving 内部介绍 - Dominik Tornow，SAP；Andrew Chen，Google](https://kccncosschn19chi.sched.com/event/NrZZ/knative-serving-zhu-tao-dominik-tornowdaelssapdaehandrew-chendaelsgoogle?iframe=no&w=100%&sidebar=yes&bg=no)

这一 Talk 是由 SAP Principal Engineer Dominik Tornow，以及 Google 开源策略项目经理 Andrew Chen 贡献的。他们主要介绍了 KNative Serving 的功能和部分实现。KNative 是由谷歌开源的，支持在 Kubernetes 上运行 Serverless 工作负载的系统。而 KNative Serving 是其中用来支持部署和服务 Serverless 应用的组件。它是构建在 Istio 之上的，但是对 Istio 提供的功能进行了更高层次的抽象。这一 Talk 最大的特色是 Slides 制作精良，加入了很多动画方便听众理解。但在网站上提供只能提供 PDF，所以有些遗憾。不过两位讲师也将出席由才云科技举办的 [CKA 上海站培训](https://www.huodongxing.com/event/5494884686811)，进行时长约 1 个小时的分享。到时也许能够有机会再次领略两位讲师深入浅出的讲解。

<figure>
	<img src="{{ site.url }}/images/kubecon/knative.png" height="500" width="700">
</figure>

### [Kubernetes 集群的大规模分布式深度学习 - Yuan Tang，蚂蚁金服；Yong Tang，MobileIron](https://kccncosschn19chi.sched.com/event/Nrcc/kubernetes-zhong-shi-zha-mao-yuan-tangdaelskuang-yan-shu-daehyong-tangdaelsmobileiron?iframe=no&w=100%&sidebar=yes&bg=no)

这一分享的主讲人之一是蚂蚁金服的 Yuan Tang，他是 TensorFlow，MXNet，XGBoost 三个开源项目的 Committer，同时也是 Kubeflow 社区一些开源项目的维护者。另一位主讲人是 TensorFlow SIG I/O lead Yong Tang，同时他也是 CoreDNS 和 Docker/Moby 社区的一些项目的维护者。由于某些原因，Yuan Tang 并没有到来上海，因此这一场 Talk 是 Yong Tang 一人进行的。

在这场分享中，首先 Yong Tang 先生介绍了 TensorFlow，Horovod 等不同框架支持的不同的分布式训练的模式，以及他们的优劣。随后介绍了 Kubeflow 社区中的一些项目（tf-operator，pytorch-operator，mxnet-operator，mpi-operator 等），这些项目可以支持在 Kubernetes 上利用不同框架，进行不同分布式模型的分布式训练任务。最后 Yong Tang 先生认为在 Kubernetes 上运行分布式训练可以充分利用 Kubernetes 自身的资源管理能力，值得一试。

### [最大限度地降低在 Kubernetes 上运行深度学习的 GPU 成本 - Kai Zhang 和 Yang Che，阿里巴巴](https://kccncosschn19chi.sched.com/event/Nree/zha-picodu-nano-kubernetes-ai-chan-zha-gpu-kai-zhang-re-yang-chedaelsqiang-tang?iframe=no&w=100%&sidebar=yes&bg=no)

这一分享主要介绍了阿里容器云服务下的开源项目 [gpushare-scheduler-extender](https://github.com/AliyunContainerService/gpushare-scheduler-extender) 的需求和实现。两位讲者也是 Kubeflow 社区中 CLI 项目的维护者。

<figure>
	<img src="{{ site.url }}/images/kubecon/gpu.png" height="500" width="700">
</figure>

GPU 在推理服务中的共享越来越成为一个工业界关注的焦点。目前在 Kubernetes 上的 GPU 共享有不同的解决方案，阿里云服务开源的这一实现借助了诸多 Kubernetes 提供的扩展机制，如 CRD，Device Plugin，Scheduler Extender 和 kubectl 插件等，无侵入地实现了 GPU 显存共享的特性。除此之外，才云科技也有一个类似的[闭源实现](https://caicloud.io/blog/5cd8e472275dbb002b9cd5b6)，也可供参考。

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.

[katib]: https://github.com/kubeflow/katib/
