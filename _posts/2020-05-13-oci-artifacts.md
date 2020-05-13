---
layout: post
title: "OCI Artifacts，面向未来的 Artifacts 分发服务"
description: 
headline:
modified: 2020-05-13
category: 
tags: []
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

容器大势，浩浩汤汤，以 Docker 为代表的容器虚拟化成为了云计算领域新的事实标准。随着发展，业界对于 Artifacts 分发的需求不再局限于 OCI Image。Helm Chart 等其他用来部署的 Artifacts，也想复用满足 [OCI Distribution 规范](https://github.com/opencontainers/distribution-spec/blob/master/spec.md) 的镜像仓库（以 Docker Distribution 为代表）的分发能力。

于是 [OCI Artifacts](https://github.com/opencontainers/artifacts) 这一指导性的文件就应运而生。通过这一特性，镜像仓库不再是只提供镜像分发能力的仓库，可以分发其他类型的 Artifacts。

本文以 Helm Chart 为例，介绍了 Helm Chart 基于 OCI Artifacts 的分发流程，分析了背后的实现，希望可以抛砖引玉。

## Helm Chart & OCI-based Registry

Helm Chart 想必大家都不陌生，就不多做解释。对于 Helm Chart 而言，其分发一直以来是一个热点话题。而利用 OCI Artifacts，Helm Chart 可以在满足 OCI Distribution 规范的镜像仓库中进行存储和分发。这一功能在 Helm 3 中以实验性能力的方式予以支持，首先介绍一下使用流程。

首先，我们利用 Docker Distribution 利用本地的 5000 端口搭建一个镜像仓库，Docker Distribution 无疑是符合 OCI 标准的。

```bash
$ docker run -dp 5000:5000 --restart=always --name registry registry
```

如果用户要使用 Helm Chart 分发的能力，首先需要利用 `helm chart save` 命令将 Helm Chart 处理为符合 OCI 标准的格式：

```bash
$ helm chart save mychart/ localhost:5000/myrepo/mychart:2.7.0
ref:     localhost:5000/myrepo/mychart:2.7.0
digest:  eba5730e169da5e6020381041ce048147a6da41ac51680dcfa2d9d5a44a6b446
size:    10.6 KiB
name:    chartmuseum
version: 1.8.2
2.7.0: saved
```

随后，我们可以直接利用与 `docker push` 类似的命令 `helm chart push`，将 Chart 推送到本地的仓库中。

```bash
$ helm chart push localhost:5000/myrepo/mychart:2.7.0
The push refers to repository [localhost:5000/myrepo/mychart]
ref:     localhost:5000/myrepo/mychart:2.7.0
digest:  eba5730e169da5e6020381041ce048147a6da41ac51680dcfa2d9d5a44a6b446
size:    10.6 KiB
name:    chartmuseum
version: 1.8.2
2.7.0: pushed to remote (1 layer, 10.6 KiB total)
```

这样这一 Chart 就像镜像一样，被推送到了构建在本地的仓库中，可以随时利用与 `docker pull` 类似的命令 `helm chart pull` 将 Chart 拉取下来。

```bash
$ helm chart remove localhost:5000/myrepo/mychart:2.7.0
2.7.0: removed

$ helm chart pull localhost:5000/myrepo/mychart:2.7.0
2.7.0: Pulling from localhost:5000/myrepo/mychart
ref:     localhost:5000/myrepo/mychart:2.7.0
digest:  eba5730e169da5e6020381041ce048147a6da41ac51680dcfa2d9d5a44a6b446
size:    10.6 KiB
name:    chartmuseum
version: 1.8.2
Status: Downloaded newer chart for localhost:5000/myrepo/mychart:2.7.0
```

使用流程就是这样，接下来介绍一下背后的技术实现。

## Under the Hood

在执行 `helm chart save` 命令时，chart 会被缓存在文件系统中，其缓存的目录结构也是遵循 [OCI Image 规范](https://github.com/opencontainers/image-spec/blob/master/image-layout.md)的：

```bash
$ tree /home/gaocegege/.cache/helm/registry/cache/
/home/gaocegege/.cache/helm/registry/cache/
├── blobs
│   └── sha256
│       ├── 2a32a8900d81297752f72e47eedb45a11f3a82237df2dd8db391ad9646a91fbf
│       ├── 63cf3d32e490f378cc2cb8131a9a8eec2b3f60a94783d1eecb3e31bcb550d89a
│       └── caad7b93c950cbefe21236842cfce58c08383302a85cf69845c57d2e3ffdce78
├── index.json
├── ingest
└── oci-layout
```

其中 oci-layout 是一个 JSON 文件，它主要负责标示所在目录是 OCI Layout 的根目录，并且记录采用的 Image Layout 的版本。

```json
{"imageLayoutVersion":"1.0.0"}
```

其中的 ingest 是一个空目录，作用存疑，没有在规范中找到它。index.json 可以理解为是为了在本地进行索引的配置文件，它的内容如下。这一文件会记录所有被 cache 的 Artifacts，并且记录一些必要的元数据。

```json
{
  "schemaVersion": 2,
  "manifests": [
    {
      "mediaType": "application/vnd.oci.image.manifest.v1+json",
      "digest": "sha256:2a32a8900d81297752f72e47eedb45a11f3a82237df2dd8db391ad9646a91fbf",
      "size": 323,
      "annotations": {
        "org.opencontainers.image.ref.name": "localhost:5000/myrepo/mychart:2.7.0"
      }
    }
  ]
}
```

而 blobs 目录下就是真正内容所在了。我们可以看到一共有三个文件，其中一个文件 `2a32a8900d81297752f72e47eedb45a11f3a82237df2dd8db391ad9646a91fbf` 与在 index.json 的 digest 的 value 中的值一致，它的 mediaType 是 `application/vnd.oci.image.manifest.v1+json`，也就是是[镜像 manifest](https://github.com/opencontainers/image-spec/blob/master/manifest.md) 的 JSON 格式，其内容为：

```json
{
  "schemaVersion": 2,
  "config": {
    "mediaType": "application/vnd.cncf.helm.config.v1+json",
    "digest": "sha256:63cf3d32e490f378cc2cb8131a9a8eec2b3f60a94783d1eecb3e31bcb550d89a",
    "size": 483
  },
  "layers": [
    {
      "mediaType": "application/tar+gzip",
      "digest": "sha256:caad7b93c950cbefe21236842cfce58c08383302a85cf69845c57d2e3ffdce78",
      "size": 10871
    }
  ]
}
```

这一 JSON 结构是由 `application/vnd.oci.image.manifest.v1+json` 定义的，包括 config 和 layers 两个部分。其中 config 记录了存储配置的 digest，layers 是一个数组，记录了不同层的 digest。

接下来，我们看一下 `application/vnd.cncf.helm.config.v1+json` 类型的内容是什么：

```json
{
  "name": "chartmuseum",
  "home": "https://github.com/helm/chartmuseum",
  "version": "1.8.2",
  "description": "Host your own Helm Chart Repository",
  "keywords": [
    "chartmuseum",
    "helm",
    "charts repo"
  ],
  "maintainers": [
    {
      "name": "codefresh-io",
      "email": "opensource@codefresh.io"
    },
    {
      "name": "cloudposse",
      "email": "hello@cloudposse.com"
    },
    {
      "name": "chartmuseum",
      "email": "chartmuseum@gmail.com"
    }
  ],
  "icon": "https://raw.githubusercontent.com/helm/chartmuseum/master/logo2.png",
  "apiVersion": "v1",
  "appVersion": "0.8.0"
}
```

这里的结构就是由 Helm 社区定义的配置了。可以看到，它与 chart.yaml 的内容保持一致，只是格式是 JSON。这些信息主要会被用来做展示时用到。

而 layers 中的类型是 `application/tar+gzip` 的内容就是真正的 chart 的存储。我们可以把它解压出来跟原本的 chart 做一个 diff，会发现两者完全一致：

```bash
$ tar -zxvf ~/.cache/helm/registry/cache/blobs/sha256/caad7b93c950cbefe21236842cfce58c08383302a85cf69845c57d2e3ffdce78
chartmuseum/Chart.yaml
chartmuseum/values.yaml
chartmuseum/templates/NOTES.txt
chartmuseum/templates/_helpers.tpl
chartmuseum/templates/deployment.yaml
chartmuseum/templates/ingress.yaml
chartmuseum/templates/pv.yaml
chartmuseum/templates/pvc.yaml
chartmuseum/templates/secret.yaml
chartmuseum/templates/service.yaml
chartmuseum/templates/serviceaccount.yaml
chartmuseum/.helmignore
chartmuseum/README.md

$ diff -urNa ./chartmuseum ./mychart
$ echo $?
$ 0
```

因此我们就可以理解，OCI Artifacts 其实是利用了现有的镜像仓库作为基础设施，扩展了它的能力，让它能够支持其他类型的 Artifacts。这一特性也可以用来做很多其他的事情，比如 [Kata Containers](https://www.oschina.net/news/114171/kata-containers-2-0s-blue-print) 想利用它来加速镜像分发的过程。

## 关于我

[高策](http://gaocegege.com)，[才云科技](https://caicloud.io) AI 平台组工程师，欢迎简历！

## 致谢

- https://github.com/hainingzhang
- https://github.com/Meoop

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.
