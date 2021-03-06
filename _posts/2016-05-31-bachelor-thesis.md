---
layout: post
title: "Word还是LaTeX"
description: 
headline:
modified: 2016-05-31
category: 随笔
tags: [SJTU]
imagefeature:
mathjax: false
chart:
comments: true
featured: false
---

毕业论文是一个很深很深的坑，可以莫名地花掉很多很多时间。论文写作花费的时间，要视毕设题目而定。一般而言，只要开题结束后就可以开始做了。但是由于我们学院允许大四保研的同学先行修读研究生课程，所以大四用来写毕设的时间并不是那么多。不过理论上而言，从一月份可以写到五月份，当然其中包括毕设的实现和论文的写作。不知道其他学院的同学情况怎么样，我用[waka time](https://wakatime.com)统计了一下，大概论文一共写了50小时左右，不包括画图的时间，是单纯写论文的时间。每天8小时，大概6天左右就可以写完了。但是毕设的实现花了很久时间来做，大概一月份就开始正式地开发，一直做到五月结束。

单就论文写作而言，有两种选择，一种是Microsoft Word，一种是LaTeX，至于邪教Pages就不要再提了。两种都在最开始的时候尝试过，下面介绍下这两种选择各自的好处与缺点。

Word的好处在于对使用者比较友好，所见即所得。相信大家都有用过Word来写文档，这一点应该是Word最具有吸引力的地方。还有就是如果用Word，会有很多同道中人，遇到问题，问一问身边的同学就基本可以解决。而且Word是一个非常有用的工具，熟练使用Word是很有竞争力的一项能力。不过Word的缺点也非常明显，首先不能对它用传统的版本管理工具进行版本管理，因为Word文档是二进制的。这个缺点在我看来是致命的，没有版本管理的情况下写文档应该蛮难过的吧。可能要维护好多个文档的副本，很辛苦。其次，Word是一个通用性的工具，虽然有模板的存在，但是还是有很多细微的问题，比如在复制的时候可能会带着原文本的格式一起复制到Word文档里等。最后，Word文档里会显示回车符，这个非常丑陋，所以如果不把文档导出为PDF格式，会比较难以阅读。

那与之相比，LaTex也有自己的优势与劣势。首先，LaTeX的文件都是文本文件，是可以通过Git来进行版本管理的。这一点对于熟悉版本管理工具的同学而言无疑是非常有吸引力的。其次，LaTeX模板已经将所有的格式问题解决了，所以对于写毕业论文的同学而言，只需要填充内容就好了。不过LaTeX有两个比较大的问题，一个在于环境配置，一个在于编译时间。LaTeX配置环境非常地复杂，涉及到好多工具与组件，以至于在Windows上从来没有成功地把环境构建起来过。不过相对而言，OS X，现在应该叫做macOS上来搭建反而会简单一点。环境的安装可以参考[交大论文latex模板环境搭建](http://gaocegege.com/Blog/%E9%9A%8F%E7%AC%94/sjtu-thesis-setup)一文。至于编译时间，因为LaTeX并不是Word那样所见即所得的工具，会存在一个将源文件编译为PDF或者其他可阅读格式的过程。因此LaTeX比较难以定位错误。

对于这两种选择，可以根据自己的喜好和需求来判断。如果使用LaTeX，建议使用在Github上的LaTex模板-[SJTUThesis](https://github.com/weijianwen/SJTUThesis)，这是由[@weijianwen](https://github.com/weijianwen)学长维护的交大学位论文LaTeX模板，本科毕业论文因为参考文献格式的问题，需要使用0.7.X版本，不建议使用0.9.X版本。除此之外，因为考虑到论文模板对于本科、研究生、和博士生论文的兼容性，模板会与本科毕业论文的格式要求有一点出入，需要自己进行一些调整。