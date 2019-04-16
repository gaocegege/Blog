---
layout: page
permalink: /about/index.html
title: 关于高策
tags: [SJTU, SE]
imagefeature:
chart: true
---

<p align="center">
	<a href="http://gaocegege.com/Blog"><img src="https://img.shields.io/badge/blog-100k%20pageviews-ffffff.svg?style=social" alt="Blog"></a>
	<a href="https://github.com/gaocegege/"><img src="https://img.shields.io/github/followers/gaocegege.svg?style=social&label=Follow" alt="GitHub"></a>
	<a href="http://gaocegege.com/resume/"><img src="https://img.shields.io/badge/resume-english-blue.svg" alt="Resume"></a>
	<a href="http://gaocegege.com/resume/cn/"><img src="https://img.shields.io/badge/%E7%AE%80%E5%8E%86-%E4%B8%AD%E6%96%87-blue.svg" alt="Resume in Chinese"></a>
	<a href="http://en.sjtu.edu.cn/"><img src="https://img.shields.io/badge/univ-SJTU-020081.svg" alt="SJTU"></a>
	<a href="http://en.sjtu.edu.cn/"><img src="https://img.shields.io/badge/degree-master-0100b3.svg" alt="Master"></a>
</p>

## 链接

- [Blog://gaocegege.com](http://gaocegege.com/Blog)
- [GitHub://gaocegege](https://github.com/gaocegege/)
- [LinkedIn://gaocegege](https://www.linkedin.com/in/gaocegege/)
- [知乎://gaocegege](https://www.zhihu.com/people/gaocegege)

## 职业经历

**才云科技** \| 2019.04 – 至今 \| 机器学习平台组 \| 软件工程师

- 实现模型服务功能

**才云科技** \| 2017.12 – 2019.03 \| 机器学习平台组 \| 合作研究

- [Kubeflow](https://github.com/kubeflow/kubeflow) 由谷歌在 2017 年开源，旨在基于 Kubernetes 支持机器学习工作负载。
- 我主要维护社区中的 TensorFlow 分布式训练支持项目 [kubeflow/tf-operator](https://github.com/kubeflow/tf-operator) 和超参数以及模型搜索平台项目 [kubeflow/katib](https://github.com/kubeflow/katib)。
	- [kubeflow/tf-operator#526](https://github.com/kubeflow/tf-operator/pull/526) 合作完成了 tf-operator 新版本的实现以及对应的测试工作。
	- [kubeflow/katib#23](https://github.com/kubeflow/katib/pull/23) 使用 multi-stage building，将 katib 组件的镜像 size 降低了 98%；同时引入 vendor，构建速度提高了 80%。
	- 基于项目完成了两篇介绍性的文章 [Kubeflow 安利：在 Kubernetes 上进行机器学习](http://gaocegege.com/Blog/%E6%9C%BA%E5%99%A8%E5%AD%A6%E4%B9%A0/kubeflow) 和 [Katib: Kubernetes native 的超参数训练系统](http://gaocegege.com/Blog/%E6%9C%BA%E5%99%A8%E5%AD%A6%E4%B9%A0/katib)，浏览量过 5000（不计算知乎，微信等其他渠道阅读）。
- 研究机器学习负载在 Kubernetes 上的调度优化。

**Google Summer of Code 2018** \| 2018.03 – 2018.08 \| [coala.io](https://coala.io/) \| 导师

- 由谷歌组织的，赞助在校大学生兼职为开源项目贡献代码的暑期活动。本次担任导师，指导一位学生参与 [coala Language Server](https://github.com/coala/coala-vs-code) 的实现。

**Google Code-In 2017** \| 2017.12 – 2018.02 \| [coala.io](https://coala.io/) \| 导师

- 由谷歌组织的，鼓励在校的高中生参与开源社区的活动。在此活动中作为导师，指导了全球各地的高中生参与 coala 社区。

**Google Summer of Code 2017** \| 2017.05 – 2017.09 \| [The Processing Foundation](https://processingfoundation.org/) \| 参与学生

- 由谷歌组织的，赞助在校大学生兼职为开源项目贡献代码的暑期活动。本次 GSoC 共有 20651 名学生注册，最终 1318 人入选，接受率 **6%**。
- 在活动期间，我实现了 [Processing.R](https://github.com/processing-r/Processing.R)，为 Processing 实现了 R 语言的支持，并且发布到了 Processing IDE 中。项目获得 90 stars，成为本次编程之夏 star 最多的项目之一。
- 在[第十届中国R会议（上海） 暨华东地区数据科学会议](http://china-r.org/sh2017/index.html)上针对这一实现发表了主题演讲 [Processing.R: 使用 R 语言实现新媒体艺术作品](http://slides.com/gaocegege/processing-r/)。
- 参与创建 [GSoC 中国社区](https://github.com/gsoc-cn/gsoc-cn)，发布 [Google Summer of Code 学生申请指南](http://gaocegege.com/Blog/%E9%9A%8F%E7%AC%94/apply-gsoc)，在知乎上获得 150 赞，博客访问逾 5000。

**Morgan Stanley** \| 2017.02 – 2017.08 \| 项目实习生

- 摩根开源的集群管理系统 [treadmill](https://github.com/Morgan-Stanley/treadmill) 在调度上的支持相对较简单。我基于 Kubernetes 的调度模型，在 treadmill 上实现了一个预研原型：[ Morgan-Stanley/treadmill#72](https://github.com/Morgan-Stanley/treadmill/pull/72)。调度延迟在 100 节点规模下与原本的调度器相比下降 12%，但大大增强了其可配置性。

**才云科技** \| 2015.12 – 2017.02 \| 项目合作

- 基于 Docker 实现了持续集成与持续部署系统 [cyclone](https://github.com/caicloud/cyclone)，主要负责 YAML 配置解析，Docker 运行时的集成等
- 在 GitHub 上获得 530 stars。

**上海触宝信息技术有限公司** \| 2015.09 – 2015.09 \| 大数据组 \| 数据工程师（实习）

- 随着业务发展，内部爬虫要进行分布式的部署与管理。我在实习期间主要负责移植爬虫代码到新的平台，优化重写部分过期的爬虫。

**蚂蚁金服（杭州）网络技术有限公司** \| 2015.07 – 2015.09 \| 国际事业部 \| Java 研发工程师（实习）

- 支付宝开展[海外直购业务](https://cshall.alipay.com/lab/help_detail.htm?help_id=451454)，用户在国外电商网站上使用支付宝下单，由支付宝负责运送至国内并进行配送。我在实习期间基于内部 [Sofa 框架](https://github.com/alipay/sofa-boot)实现了商品包裹通关的相应逻辑，以及为运维提供后台管理支持。

## 教育经历

- **上海交通大学** \| 软件学院 \| 2016.09 – 2019.03 (预计) \| 研究生 \| 软件工程
- **上海交通大学** \| 软件学院 & 凯原法学院 \| 2012.09 – 2016.06 \| 软件工程（辅修法学）
- **上海纽约大学附属洋泾中学** \| 2009.09 – 2012.06

## 发表论文

- **Ce Gao**, R. R., and Cai, H. Gai: A centralized tree-based scheduler for
machine learning workload in large shared clusters. In International
Conference on Algorithms and Architectures for Parallel Processing (2018), Springer.
- Xinyuan Huang, Amit Saha, D. D., and **Ce Gao**. Kubebench: A
benchmarking platform for ml workloads. In International Conference
on Artificial Intelligence for Industries (2018), IEEE.

## 演讲经历

- [**GAI: A Centralized Tree-Based Scheduler for Machine Learning Workload in Large Shared Clusters**](https://docs.google.com/presentation/d/15fPljYu8a8J2X3MPOZIkccgyh6i0kyQGqdnQMyIh-5I/edit?usp=sharing)，ICA3PP'18，中国广州，2018 年 11 月
- [**对 Kubeflow 上的机器学习工作负载做基准测试**](sched.co/FvLV)，KubeCon China 2018，中国上海，2018 年 11 月
- [**Kubeflow: Run ML workloads on Kubernetes**](https://docs.google.com/presentation/d/1ED24TCnlBVzyJz0aCEAtXQQh0_W1RKSeapP3QZ0fTKA/edit?usp=sharing)，统计之都 2018 年 Meetup，中国上海，2018 年 7 月
- [**Processing.R: 使用 R 语言实现新媒体艺术作品**](http://slides.com/gaocegege/processing-r)，第十届中国 R 语言会议，中国上海，2017 年 11 月

## 所获奖项

- 2017.10 **Go 基金会 2017 中国黑客⻢拉松** 二等奖 & PingCAP 专项奖
- 2017.10 **因特尔中国奖学金计划** 奖学金
- 2016.11 **第七届中国大学生服务外包创新创业大赛** 一等奖
- 2016.12 **第十三届全国研究生数学建模竞赛** 二等奖
- 2015.03 **美国大学生数学建模竞赛** 二等奖
- 2014.11 **中国大学生数学建模竞赛上海赛区** 一等奖
- 2014.07 **大众点评校园黑客马拉松** 二等奖 & 优秀个人
- 2013.09 **上海交通大学奖学金** 三等奖

## 活动经历

- Go Hack 2017 参赛者
	- [参赛日记：Go Hack 17: Killy 日记](http://gaocegege.com/Blog/%E9%9A%8F%E7%AC%94/killy)
- LinuxCon 17 参会者
	- [会议回顾文章: LinuxCon Recap](http://gaocegege.com/Blog/%E9%9A%8F%E7%AC%94/linuxcon)
- 2016 年云赛空间黑客马拉松参与者
- 2016 年中国容器大会上海站参会者
- 2016 CCTC 云计算会议参会者
- 2016 年中国容器大会北京站参会者
- HackShanghai 2015 黑客马拉松参与者
- Apache 路演 2015 北京站参会者
- 2015 年美国数学建模比赛二等奖
- HackShanghai 2014 黑客马拉松参与者
	- [新闻报道：三名大学生奋战24小时 开发出新奇“空中鼠标”](http://newspaper.jfdaily.com/xwcb/html/2014-11/17/content_37290.htm)
- 2015 年大众点评校园黑客马拉松

## 业余项目

[**Scrala**](https://github.com/dyweb/scrala)

- 使用 Scala 实现的爬虫框架，受 scrapy 启发。
- 87 stars in GitHub

[**Maintainer**](https://github.com/gaocegege/maintainer)

- 帮助开源社区维护者更好地维护项目的命令行工具。
- 126 stars in GitHub

[**tosknight**](https://github.com/siglt/tosknight)

- 定期获得腾讯、网易、知乎、百度等网站的用户协议或者隐私条款，并且记录它们的版本变化, 与女朋友以及上海交大法学院一法学博士学长一起合作的探索性作品

[**killy**](https://github.com/prism-river/killy)

- Minecraft 插件，在 Minecraft 中以可视化的方式查看 TiDB 集群状态。
- Go 基金会 2017 中国黑客⻢拉松参赛二等奖 & PingCAP 专项奖
- 48 stars in GitHub

[coala-vs-code](https://github.com/coala/coala-vs-code)

- 基于 [Language Server Protocol](https://github.com/Microsoft/language-server-protocol) 实现的 Visual Studio Code 插件。
- 在 Google Summer of Code 2018 中指导学生进行更加完整的实现。

[Deedy-Resume-For-Chinese](https://github.com/gaocegege/Deedy-Resume-for-Chinese)

- 适合应届毕业生的 LaTeX 简历中文模板。

[scala-renren](https://github.com/gaocegege/scala-renren) & [scala-github-relationship](https://github.com/gaocegege/scala-github-relationship)

- scala 实现的人人网好友关系图以及 GitHub 关注图。

[yet-another-insane](https://github.com/gaocegege/yet-another-insane)

- Scala 过程间 Control Flow Graph 生成器，课程作业。

[csdn-blog-export](https://github.com/gaocegege/csdn-blog-export)

- 导出 CSDN 博客文章为 markdown 或 html, 使用了 Aaron Swartz 的 html2text，致敬。

[awesome-se](https://github.com/SJTU-SE/awesome-se)

- 上海交通大学软件学院本科编程作业参考。

[electsys-safari](https://github.com/dyweb/electsys-safari)

- 上海交通大学选课插件在 safari 上的实现。

## 业余开源贡献

- [weijianwen/SJTUThesis](https://github.com/sjtug/SJTUThesis) Collaborator
	- 为学士论文模板添加英文大摘要
	- 用开源字体替换 Adobe 字体
- [pingcap/tidb](https://github.com/pingcap/tidb/commits/master?author=gaocegege) Contributor
	- 为了对 contributor 友好，在 travis 里引入了覆盖率测试
	- 添加了 built-in truncate function
	- 完善了 expression 包的注释
- [docker/docker](https://github.com/docker/docker/commits/master?author=gaocegege) Contributor
	- 添加了一个 subcommand 参数 `docker service ps -q`
- [opencontainers/runc](https://github.com/opencontainers/runc/commits/master?author=gaocegege) Contributor
	- 为了 Fix [docker/docker#27484](https://github.com/docker/docker/issues/27484) 对上游进行的修改，不过后来被证明是错误的= =
- [alibaba/pouch](https://github.com/alibaba/pouch/commits?author=gaocegege) Contributor
	- 为其 CI 更新 go 版本, 移除对环境路径的 hack
- [cncf/devstats](https://github.com/cncf/devstats/commits/master?author=gaocegege)
	- 添加 Vendor 支持
<!-- - [kubernetes/test-infra]() -->

<div class="cf"></div>

<section class="summer-disqus row">
    <div class="small-12 columns">
        <h1 class="summer-comments-header">评论</h1>
        <div id="disqus_thread"></div>
        {% include disqus_comments.html %}
    </div>
</section>
