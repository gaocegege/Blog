---
layout: post
title: "再议评论服务：从多说到 Disqus"
description: 
headline:
modified: 2017-03-27
category: blog
tags: [comment]
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

多说是国内首屈一指的博客评论服务，与 Disqus 相比，多说对国内用户的本地化做的非常好。支持分享到微博，微信等等国内常用的 SNS 平台，同时有着不少微博上的表情可以使用。虽然它也有着一些 Bug，比如一篇文章可能在后台会莫名其妙地变成了 N 篇文章，自动给你来一个 N replica 备份的样子= = 但是仍然不失为一款称得上是业界良心的服务。

在大二的时候因为想把自己写 CSAPP Lab 的经历记录下来，开始在新浪博客，点点轻博客，和 [CSDN](http://blog.csdn.net/cecesjtu) 三个平台之间来回尝试着。后来在 CSDN 上停留了一年的时间，但是不喜欢他的编辑器，于是转投了 Github Pages。最开始的时候评论是用 Disqus 的，后来迁移到了多说上。因为 Disqus 对国内用户不是特别友好，这不是它本身的问题而是 GFW 的问题。不翻墙就看不到评论使得评论的到达率很低。随后迁移到多说上后，评论也越来越多了起来，因此也一直沿用至今。

在3月21号的时候，多说宣布关闭项目，不再提供服务，让人唏嘘不已。多数猜测认为多说难以完成商业化的盈利，人力物力的投入得不到经济回报，因此决定不再继续维护多说。具体情况如何，外人不得而知，不管怎样感谢多说过去提供的服务，同时也不得不寻找一个多说的替代方案。

## 理想的评论服务

在我的期望里，替代方案要具有下面这样几个功能：

* 支持多说评论导入（高优先级）
* 服务稳定，短期内不会关停或者被关停（高优先级）
* 不会被墙（中等优先级）
* 简洁美观（中等优先级）
* 支持游客留言（中等优先级）
* 可定制（中低优先级）
* 无广告或者会支付广告费给博主（低优先级）（/w\ 挣外快养家啊）

因为博客在过去两年的时间里积累了一些评论，其中有一些有趣的交流，不舍得就这样放弃，因此最大的需求是支持多说的评论导入。而我的博客来访者大多都是国内的朋友，因此最理想的情况下，评论服务是在国内网络可以访问到的。简洁美观与可定制，是从多说继承来的需求。多说评论框的深度可定制使它有了很多的玩法，有很多网友根据 UA 来给评论打上五颜六色的 Tag，对于我这样喜欢花里胡哨的东西的用户来说是难以抵挡的诱惑。最后一点在以前的我眼里是非常重要的，一个高质量的博客不应该有广告。但是就国内这个情况，这点是不指望了，因此降低下要求，能给点分红也成啊 hhh

## 替代方案

在 [如何评价“多说”即将关闭？有什么替代方案？ - 知乎](https://www.zhihu.com/question/57426274) 的回答中，选取了一些看上去还算是靠谱的服务进行了简单的尝试。他们分别是：

* [网易云跟帖](https://gentie.163.com/)
* [畅言](http://changyan.kuaizhan.com/)
* [友言](http://www.uyan.cc/)
* [Disqus](https://disqus.com/)
* [来必力](https://livere.com/)

最后还是选择了 [Disqus](https://disqus.com/)，其他的服务为什么不好会在下面进行简单的说明。

### 网易云跟帖

首先被否定的是网易云跟帖。网易云音乐给了人很多对网易系产品的信心，但并不代表网易做的产品都是良心。网易云跟帖看上去挺好的，但是很多细节让人觉得不舒服。

<figure>
	<img src="http://active-pic.nosdn.127.net/526ce46732e246bcbc97b39187f5fea820170208130719.png" alt="网易云跟帖" height="500" width="500">
	<figcaption>网易云跟帖</figcaption>
</figure>

首先里面谜之“抵制低俗，文明上网，登录发帖”。这么红的文字，出现在主打技术的个人博客里，违和感太强。还有就是在每个评论中的某某地网友，都什么年代了还网友。以及直接把对方的所在地打印出来，在我觉得是一种不尊重的行为。包括无用户名用户的默认前缀“有态度网友”，有没有态度用你说么。槽点太多，要是用了这个服务，估计除了红又专的中科大的网友们没有人再来我的博客里评论了（黑一发）

### 畅言

畅言是搜狐旗下的社会化评论服务，我觉得跟网易云跟帖差不多，都是跟自家的评论有点关系的，被拆分出来的云服务。

<figure>
	<img src="{{ site.url }}/images/duoshuo/changyan.png" alt="畅言" height="500" width="500">
	<figcaption>畅言</figcaption>
</figure>

畅言的问题在于功能的冗余，以及和网易云跟帖一样，太正能量太远古。竟然还有盖章这样的功能，盖章要求活跃度，这样的设定不适合个人独立博客来使用。而且默认的评论框样式很丑。可能畅言更适合企业用户，对于独立博客这样的用户群，并不适合用它来做评论。

### 友言

友言是国内社会化评论服务中味道最正的一家了。我觉得友言有希望能够成为接任多说的产品。

<figure>
	<img src="{{ site.url }}/images/duoshuo/youyan.png" alt="友言" height="500" width="500">
	<figcaption>友言</figcaption>
</figure>

原本我是打算用它来替代多说的，但是看了一眼[谁在使用友言](http://www.uyan.cc/whouse)，里面不少现在已经是死链接了，比较担心友言没过多久也会挂了，稳定第一，因此也被放弃了。

### 来必力

来必力是韩国的一款社会化评论服务，它的完成度很高，拥有和多说类似的功能，而且非常美观，看历史也不是很快就会死的服务。

<figure>
	<img src="{{ site.url }}/images/duoshuo/livere.png" alt="来必力" height="500" width="650">
	<figcaption>来必力</figcaption>
</figure>

但是最近都在抵制韩国，之前国足踢韩国的时候恶补了一下韩国的黑历史，有点轻微的爱国情怀在荡漾，因此也被放弃了。各位要是没有这方面的考量，完全可以选择这个服务，它的 UI 非常的现代化，而且在引用方面有一些比 Disqus 和多说都要方便的实现，总的来说是一个不错的产品。

### Disqus

想必有博客评论需求的都会听说过 Disqus，它应该是行业当之无愧的老大吧。它在迁移方面的支持特别好，目前也有比较易用的工具支持从多说到 Disqus 的迁移，而且它支持 URL mapper 等等大大降低迁移难度的工具，这使得转入 Disqus 的门槛很低，而且 Disqus 本身功能非常齐全，除了是被墙的以外，我的其他需求它都可以达成。最后也只有重新迁回 Disqus。

## 迁移

选定了 Disqus 后，迁移的过程还是相对比较简单的，GitHub 上有一个 [duoshuo-migrator](https://github.com/JamesPan/duoshuo-migrator)，是一个方便大家进行博客迁移的工具，但是有时会遇到一些问题，比如在多说中有一个 bug，会导致文章没有 URL，而在 duoshuo-migrator 中是默认每一篇文章都有 URL 的。因此会报错：

```
Traceback (most recent call last):
  File "duoshuo-migrator.py", line 153, in <module>
    main()
  File "duoshuo-migrator.py", line 144, in main
    articles = json2objects(data)
  File "duoshuo-migrator.py", line 51, in json2objects
    link = art['url']
KeyError: 'url'
```

所以在导出多说的评论与文章后，需要先做一遍简单的数据清洗，洗掉没有 URL 的文章，然后再按照 repo 里的说法，去进行就好了。

## TL; DR

多说不能用了，可以选择迁移到来必力或者 Disqus，Disqus 的迁移很简单。

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commerical use.
