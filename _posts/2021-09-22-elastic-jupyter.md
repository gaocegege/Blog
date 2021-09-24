---
layout: post
title: "云原生的弹性 AI 训练系列之三：如何借助弹性伸缩的 Jupyter Notebook，解决程序运行长期占用 GPU 的问题"
description: 
headline:
modified: 2021-09-22
category: kubernetes
tags: []
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

Jupyter Notebooks 是目前应用最为广泛的交互式开发环境，它很好地满足了数据科学、深度学习模型构建等场景的代码开发需求。不过另一方面，Jupyter Notebooks 在方便了算法工程师和数据科学家们日常开发工作的同时，也对基础架构提出了更多的挑战。

<figure>
	<img src="{{ site.url }}/images/elastic-jupyter/jupyter.png" height="500" width="500">
    <figcaption>Jupyter Notebooks</figcaption>
</figure>

## 资源利用率的问题

最大的挑战来自于 GPU 资源利用率。在运行的过程中即使没有代码在运行，Notebook 也会长期占用着 GPU，造成 GPU 的空置等问题。在大规模部署 Jupyter 实例的场景下，一般会通过 Kubernetes 创建多个 Notebook 实例，分配给不同的算法工程师使用。在 Kubernetes 集群上运行 Jupyter Notebooks 的时候，需要在对应的 Deployment 中事先申请 GPU，这样 GPU 会与对应的 Notebook 实例绑定，每个 Notebook 实例都会占用一张 GPU 显卡。

然而同一时间，并不是所有的算法工程师都在使用 GPU。在 Jupyter 中，编辑代码的过程是不需要使用计算资源的，只有在执行 Cell 中的代码片段时，才会使用 CPU 或 GPU 等硬件资源，执行并返回结果。可以预见到，在某些情况下，如果通过这样的部署方式会造成相当程度的资源浪费。

<figure>
	<img src="{{ site.url }}/images/elastic-jupyter/traditional.png" height="500" width="500">
    <figcaption>传统的使用方式</figcaption>
</figure>

造成这一问题的原因主要是原生的 Jupyter Notebooks 没有很好地适配 Kubernetes。在介绍问题原因之前，先简单概述一下 Jupyter Notebook 的技术架构。如下图所示，Jupyter Notebook 主要由三部分组成，分别是用户和浏览器端，Notebook Server 和 Kernel。其中用户和浏览器端是 Jupyter 的前端，主要负责展示代码和执行结果等。Notebook Server 是它的后端服务器，来自浏览器的代码执行请求会被 Notebook Server 处理，分派给 Kernel 执行。Kernel 是真正负责执行代码，返回结果。

<figure>
	<img src="{{ site.url }}/images/elastic-jupyter/notebook_components.png" height="500" width="500">
    <figcaption>Jupyter Notebooks 架构</figcaption>
</figure>

在传统的使用方式中，用户会通过 `jupyter notebook $CODE_PATH` 等命令，在本地运行 Jupyter Notebook Server，随后访问浏览器中的 Jupyter 交互式开发界面。当代码需要执行时，Notebook Server 会创建一个独立的 Kernel 进程，这一进程会使用 GPU 等运行。在 Kernel 长期空闲，没有代码需要执行时，这一进程会被终止，GPU 也就不再会被占用。

而当部署在 Kuberenetes 之上后，问题就产生了。Notebook Server 和 Kernel 运行在同一个 Pod 的同一个容器下，尽管只有 Kernel 需要 GPU 等硬件加速器资源，但是还是需要给其提前申请一个 GPU，而在 Notebook Server 的整个生命周期中，这一块 GPU 始终与 Pod 绑定。尽管在 Kernel 进程空闲时仍然可以被回收，但是已经分配给 Pod 的 GPU 卡却不能再交还给 Kubernetes 进行调度了。

## 解决方案

为了解决这一问题，我们开源了项目 [elastic-jupyter-operator](https://github.com/tkestack/elastic-jupyter-operator/)。思路非常朴素：问题源于 Notebook Server 和 Kernel 在同一个 Pod 中，那只要将他们分开部署，让 Notebook Server 在单独的 Pod 中，Kernel 也在单独的 Pod 中，相互之间通过 ZeroMQ 通信即可。

为了实现这一目的，我们在 Kubernetes 中实现了 5 个 CRD，同时为 Jupyter 引入了一个新的 KernelLauncher 实现。通过它们，用户可以在 GPU 空闲时将 Kernel 回收释放，在需要执行代码时再动态地申请 GPU 资源，创建 Kernel Pod 进行代码执行。

<figure>
	<img src="{{ site.url }}/images/elastic-jupyter/elastic.png" height="500" width="500">
    <figcaption>elastic-jupyter-operator</figcaption>
</figure>

### 简单的例子

下面我们将通过一个例子介绍使用方式。首先我们需要创建 JupyterNotebook CR（CustomResource），这一个 CR 会创建出对应的 Notebook Server：

```yaml
apiVersion: kubeflow.tkestack.io/v1alpha1
kind: JupyterNotebook
metadata:
  name: jupyternotebook-elastic
spec:
  gateway:
    name: jupytergateway-elastic
    namespace: default
  auth:
    mode: disable
```

其中指定了 gateway，这是另外一个 CR JupyterGateway。为了能够让 Jupyter 支持远程的 Kernel，需要这样一个网关进行请求的转发。我们同样需要创建这样一个 CR：

```yaml
apiVersion: kubeflow.tkestack.io/v1alpha1
kind: JupyterGateway
metadata:
  name: jupytergateway-elastic
spec:
  cullIdleTimeout: 3600
  image: ccr.ccs.tencentyun.com/kubeflow-oteam/enterprise-gateway:2.5.0
```

JupyterGateway CR 中的配置 `cullIdleTimeout` 指定了经过多久的空闲时间后，其管理的 Kernel Pod 会被系统回收释放。在例子中是 1 个小时。

创建完这两个资源后，就可以体验到弹性伸缩的 Jupyter Notebook 了。如果长期没有使用的话，Kernel 会被回收。

```
$ kubectl apply -f ./examples/elastic/kubeflow.tkestack.io_v1alpha1_jupyternotebook.yaml
$ kubectl apply -f ./examples/elastic/kubeflow.tkestack.io_v1alpha1_jupytergateway.yaml
$ kubectl port-forward deploy/jupyternotebook-elastic 8888:8888
$ kubectl get pods 
NAME                                          READY   STATUS    RESTARTS   AGE
jovyan-219cfd49-89ad-428c-8e0d-3e61e15d79a7   1/1     Running   0          170m
jupytergateway-elastic-868d8f465c-8mg44       1/1     Running   0          3h
jupyternotebook-elastic-787d94bb4b-xdwnc      1/1     Running   0          3h10m
```



## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.
