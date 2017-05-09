---
layout: post
title: "Maintainer 项目安利，让你的 Repo 更加友好"
description: 
headline:
modified: 2017-05-09
category: 安利
tags: []
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

[maintainer](https://github.com/gaocegege/maintainer) 是一个最近造的轮子，它的愿景是很大的，希望能够尽可能地方便 GitHub Maintainer 的维护工作，但现在的功能相对来说还比较单薄。目前只能根据 repository 来生成 CHANGELOG, AUTHORS, CONTRIBUTING 等等。

maintainer 是用 Go 来实现的，原本的动机是因为最近在准备 Google Summer of Code，在想如何能够提高自己项目的命中率，于是决定尽量把 repository 经营地看上去更加友好些吧。于是就开始寻找类似的轮子，发现没什么合适的，大多数轮子都只是关注在一个方面，没有一个总览性质的，于是就决定自己来实现一个。因为现在已经有了很多现有的工具，只是把他们结合起来就好了。对于 CHANGELOG 的生成，采用了 [github-changelog-generator](https://github.com/skywinder/github-changelog-generator)，一个非常成熟的变更日志生成的工具。而对于 AUTHORS 和 CONTRIBUTING 的生成，是自己实现的，这部分相对比较简单。目前在做有关 badge 推荐的 feature，想法还比较幼稚，没有想到好的解决思路。

<figure>
	<img src="https://github.com/gaocegege/maintainer/raw/master/docs/img/logo.png" alt="maintainer logo" height="300" width="300">
	<figcaption>maintainer logo</figcaption>
</figure>

这是 maintainer 的 logo，结合了 GitHub 的 octocat 和 Go 的 gopher，但是看起来像是个智障= =

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.
