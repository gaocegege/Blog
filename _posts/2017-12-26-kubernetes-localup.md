---
layout: post
title: "Kubernetes hack/local-up-cluster.sh 无法启动 DNS 的问题溯源"
description: 
headline:
modified: 2017-12-26
category: Kubernetes
tags: []
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

最近在关注 [google/kubeflow](https://github.com/google/kubeflow), 这是一个 run TensorFlow on Kubernetes 的项目, 所以涉及频繁地启动 Kubernetes 集群来做测试. 而因为我们对 Kubernetes 环境有要求, 必须是 1.7 版本, 所以选择了 v1.7.11 作为测试版本, 使用脚本 `hack/local-up-cluster.sh` 来构建出一个临时的 Kubernetes 本地集群, 其中只有一个 node, 但是也已经够用了, 因为暂时不涉及调度相关的实现.

但是在使用 `hack/local-up-cluster.sh` 的时候遇到了一个小坑. Kubeflow 会为 TensorFlow 的每个 worker 和 PS 创建一个对应的 service, 所以需要用到 kube-dns 的一些功能. 但是 v1.7.11 在执行 `hack/local-up-cluster.sh` 会有报错:

```
clusterrolebinding "system:kube-dns" created
serviceaccount "kube-dns" created
configmap "kube-dns" created
error: unable to recognize "kubedns-deployment.yaml": no matches for extensions/, Kind=Deployment
service "kube-dns" created
Kube-dns deployment and service successfully deployed.
```

这个问题会导致不能根据 service 的 name 解析到对应的 IP, 因此在 Kubeflow 中的表现就是 worker-0 会一直在等 PS 的 response. 这个问题在社区中也有反馈: [kubernetes/kubernetes#47739](https://github.com/kubernetes/kubernetes/issues/47739), 以及有了对应的修复: [kubernetes/kubernetes#49072](https://github.com/kubernetes/kubernetes/pull/49072).

但是按照上述 PR 中进行修改还是不够的, 还是会遇到新的问题:

```
Waiting for apiserver to come up
!!! [0720 11:47:43] Timed out waiting for apiserver:  to answer at https://127.0.0.1:6443/healthz; tried 20 waiting 1 between each
check apiserver logs: /tmp/kube-apiserver.log
```

这个问题在 PR 中也有回复: [#issuecomment-316798981](https://github.com/kubernetes/kubernetes/pull/49072#issuecomment-316798981), 简单来说就是要把 `ENABLE_RBAC` 打开, 这样就可以成功地在本地跑一个 Kubernetes 集群并且有可用的 kube-dns 支持了. 

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.
