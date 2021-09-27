---
layout: post
title: "用户服务条款是互联网最大的谎言：一个 side project 的缘起"
description: 
headline:
modified: 2021-09-27
category: 随笔
tags: []
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

只要是生活在当下的网友，一定对用户服务条款并不陌生。当我们在使用任何一个互联网上提供的服务或者网站时，都会被要求阅读并且同意对应的服务条款。

> 服务条款（Terms of service，通常简称为TOS或ToS）是服务提供者与用户之间的一种契约，该契约由服务提供者拟定。用户必须同意遵守服务条款才能使用服务提供者所提供的服务[1]。服务条款的内容有时是一个关于网站使用的免责声明。

但是，我相信并没有多少人真的会仔细阅读其中的内容。举例说明，著名的短视频应用抖音的[用户协议](https://www.douyin.com/agreements/?id=6773906068725565448)一共有 1.5w 字左右，它的[隐私条款](https://www.douyin.com/agreements/?id=6773901168964798477)则有 1.6w 字，加起来一共 3w 字的阅读量。认真读下来起码也要 1 个小时。更不必说这些条款协议中，充斥着众多的法律名词和计算机术语。

另外，就算我们真的仔细审阅了这些条款与协议，给到我们的选择也只有接受。因为不接受条款内容意味着无法使用对应的服务。如果我们不同意抖音的用户协议和隐私条款，字节跳动就不会再为我们提供抖音相关的服务，一个月活 5.5 亿的国民应用就对我们关上了大门。所以其实作为用户，并没有太多选择的余地。

这也就有了标题中的那句话，用户服务条款是互联网最大的谎言。它最早是被 [Terms of Service; Didn't Read](https://tosdr.org/)（以下称为 ToS; DR） 提出。因为大多数的用户协议冗长而晦涩，成为了形同虚设的摆设，所以早在 2011 年，就有人思考用户协议能不能像 GPL 开源许可，或者 [CreativeCommons](https://creativecommons.org/) 一样，由一些标准化的文本或者标志来表明，这一服务的服务条款由哪些部分组成。

[ToS; DR][] 直到目前，仍然致力于此。它将用户协议和隐私条款等法律文本进行了统一的分类。虽然各个应用或者网站的用户协议仍然是千差万别的，但是它们有着一些共性。比如，几乎所有的用户协议都会写明它们会如何使用 Cookie，如何使用用户的个人信息等。针对这些共性，[ToS; DR][] 将用户协议和条款的内容总结出了一些要点。这些要点综合起来基本反应了用户协议的内容，同时这些要点又是通用的，不同的应用或网站只是在这些要点上采取了不同的措辞。这里以其中收录的 Bilibili 为例：

<figure>
	<img src="{{ site.url }}/images/tosknight/bilibili.png" height="500" width="500">
    <figcaption>Bilibili Grade on ToS; DR</figcaption>
</figure>

B 站的用户协议同样非常复杂难懂，但是在 [ToS; DR][] 上它被总结为了 20 多个要点。而且我们只需要关注红色、黄色和绿色的要点即可，灰色的要点意味着它对于用户隐私而言并无过多描述或者并不重要。比如 B 站的第二点：This service can view your browser history。

<figure>
	<img src="{{ site.url }}/images/tosknight/bilibili-2.png" height="500" width="500">
    <figcaption>This service can view your browser history</figcaption>
</figure>

我们能够看到这一要点对应的条款或协议原文文本。如果没有 [ToS; DR][]，或许只有认真阅读过 B 站隐私条款的极少数用户，才会知道原来 B 站会收集用户的浏览器浏览记录，而且 B 站认为浏览器浏览信息并不是个人敏感信息 XD

## Tosknight：追踪 ToS 的版本变化

到这里为止，基本都是对 [ToS; DR][] 的安利，我个人非常喜欢这个项目。不过它并不是这篇文章的主题，这篇文章的主题是我和我的[女朋友](http://blog.xuruowei.com/)，以及上海交大的法学 Phd 学长 [Yuhang Shi](https://shiyuhang.org/) 三个人做的一个 side project：[Terms of Service Knight
](https://siglt.github.io/tosknight-ui/)（以下称为 Tosknight）。这个项目的思路和技术实现都很有意思，后面我慢慢来介绍。

项目最早萌芽于 2016 年，我在交大刚刚拿到了本科的法学和计算机学位。那时候对 Legal Tech 这个技术方向很感兴趣。而 Yuhang Shi 学长也正在交大徐汇校区读博士，在他的博客上有很多关于法律与互联网结合领域的文章，于是我就在某天网上冲浪时看到了。

在 2017 年我们借着一个周末一起吃了一顿饭，他提出了这个项目的想法：虽然 [ToS; DR][] 是一个非常好的平台，但是一方面它更多收录了国外的网站和服务，另外一方面它也不能很好地追踪同一个网站或服务的用户协议或者隐私条款，在不同时期的版本变化。这对他的日常研究和工作造成了一定的困扰，每次服务提供商更新用户协议时也不会提供 ChangeLog，如果要知道与之前版本的差异，需要逐条人工比对。

我盘算了一下，这应该是一个相对比较简单的工程问题。只要我们定时爬取不同网站的用户协议，记录两次爬取到的 HTML 页面的 diff 并展示出来就可以了。于是打算花一晚上的时间实现一下，但是满打满算最后花了一周的时间才做了一个勉强可用的版本。期间主要遇到了这些挑战：

- 通过定期爬取的方式，如何确定用户协议是否真的发生了更新
- 如何让维护成本尽可能地低

第一个挑战，是因为有时用户协议文本所在的页面的 HTML 发生变动，并不一定来自于文本本身。由于用户协议页面一般是一个维护在服务或者网站上的子页面，它的导航栏或者是侧边栏等也会随着网站功能的迭代而发生变化。

作为一个 side project，本身就是用爱发电，如果为了维护它需要投入较多的时间或者是金钱，那必定是难以持续的。因此它的维护成本必须尽可能的低，这也是第二个挑战的由来。

因此围绕着这两个挑战和目标，[Tosknight][] 的架构是很这样的：

<figure>
	<img src="{{ site.url }}/images/tosknight/arch.png" height="500" width="500">
    <figcaption>架构</figcaption>
</figure>

Tosknight 共有三个组件组成：分别是 [CLI](https://github.com/siglt/tosknight)，[storage](https://github.com/siglt/tosknight-storage) 和 [UI](https://github.com/siglt/tosknight-ui)。[Tosknight CLI][1] 是一个命令行工具，在使用的时候需要指定两个参数，分别是 `source.yml` 的位置和 Tosknight storage 目录所在的位置。CLI 会通过 [colly](https://github.com/gocolly/colly) 爬取 `source.yml` 中的所有用户协议。随后使用 [html2text](https://github.com/Alir3z4/html2text/) 输出内容，使用 Unix 内置 diff 判断文件修改，如果修改则会保存修改版本。同时在这个过程中同样会保存一些元信息，为之后的 UI 展示做准备。

```yaml
webs:
  - name: 京东
    items:
      - name: 京东用户注册协议
        url: https://in.m.jd.com/help/app/register_info.html
      - name: 京东隐私政策
        url: https://about.jd.com/privacy/
  - name: OFO
    items:
      - name: OFO共享单车服务协议
        url: https://common.ofo.so/about/legal.html?11#general
...
```

其中 `source.yml` 中定义了需要定期爬取的页面，并且根据不同的集团公司进行了分类。值得一提的是，其中用到的工具 [html2text](https://github.com/Alir3z4/html2text/) 最早是由 [Aaron Swartz](https://en.wikipedia.org/wiki/Aaron_Swartz) 实现的，致敬。

为了使得维护成本尽可能低，整体的设计都是围绕如何白嫖 GitHub 进行的。这一设计原则主要体现在 [Tosknight storage][2]。项目需要介质来存储用户协议的历史版本，用以比对版本之间的差异。我们选择了把它们存储在一个 GitHub repo 中，这样就不再需要为存储支付额外的费用。每次 [CLI][1] 会通过 cron 的方式在本地执行，结果会上传到 [Tosknight storage][2]。随后触发 [UI][3] 的更新。

<figure>
	<img src="{{ site.url }}/images/tosknight/demo.png" height="500" width="500">
    <figcaption>UI</figcaption>
</figure>

<figure>
	<img src="{{ site.url }}/images/tosknight/dji.png" height="500" width="500">
    <figcaption>UI</figcaption>
</figure>

## 结

随着数据合规和隐私安全越来越受到重视，对用户协议的关注会越来越多。希望在未来，用户协议不再只有接受和不接受两个选择，而是可以部分接受。目前部分应用允许用户自行关闭个性化推荐功能，再到允许用户下载个人数据，是一个非常好的趋势和现象。

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.

[ToS; DR]: https://tosdr.org/
[Tosknight]: https://siglt.github.io/tosknight-ui/
[1]: https://github.com/siglt/tosknight
[2]: https://github.com/siglt/tosknight-storage
[3]: https://github.com/siglt/tosknight-ui