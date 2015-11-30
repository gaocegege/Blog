---
layout: post
title: "3D打印像素画"
description: 玩呗
headline:
modified: 2015-11-30
category: 随笔
tags: []
imagefeature:
mathjax: false
chart:
comments: true
featured: false
---

大二有段时间一直痴迷于Minecraft中无法自拔，以至于一度差点荒废学业。现在想想，一部分原因是自己上大学以后不太在意成绩，另一部分原因也是因为Minecraft的可玩性实在是太高了。。

<figure>
	<img src="{{ site.url }}/images/mc/mc.jpg" alt="人生中第一个mod" height="400" width="400">
	<figcaption>写的第一个Mod Demo</figcaption>
</figure>

上面的图是大二暑假的时候，花了一上午的时间用Eclipse写的第一个MC的mod，就是新定义了一种方块，方块上有一个"测"字，现在看起来10分钟就可以写完啦，但在当时那个非常弱的时候，这个给了我好大的成就感(≖ ‿ ≖)✧

<figure>
	<img src="{{ site.url }}/images/mc/ipad.jpg" alt="造轮子" height="400" width="400">
	<figcaption>手撸ipad</figcaption>
</figure>

也是大二暑假，照着网上的模型手撸了一个ipad，当时是因为学帅听说我拿了点评Hackathon的奖品，是一个ipad mini，开玩笑让我也给他一个（这人好黑啊），然后就花时间撸了一个出来hhh，当时也是费心费力啊。

<figure>
	<img src="{{ site.url }}/images/mc/ass.jpg" alt="Assassin" height="400" width="400">
	<figcaption>Assassin在金字塔前</figcaption>
</figure>

这幅图是第一次在Minecraft中遇到金字塔，非常兴奋，截图发了人人，但是所有人都在讨论用到的光影包hhhh，当时的电脑还是那台微星，完全带的动。

呃，似乎走远了，这篇博文是介绍如何3D打印像素画的，嗯，回归主题。

## HOWTO

呃，所谓像素画，就是像素风格的画嘛，那因为是像素化的，所以就可以非常自然地放到Minecraft里面去，那如果可以放到MC里，那就可以借助MC中现有的工具来导出支持3D打印的格式，从而3D打印出来。其中用到的工具有这样几个，首先是[Minecraft Structure Planner](http://minecraftstructureplanner.com/)，这是一个用来设计MC地图的工具，它支持将设计出来的导出成特定的格式，这种格式可以被[MCEdit](http://www.mcedit.net/)导入，然后构建成模型，最后可以对MC目录中已经生成的地图文件进行修改。最后，我们就可以用[Mineways](http://www.realtimerendering.com/erich/minecraft/public/mineways/)来把地图的某些部分打印出来。

这样的做法好处就是非常地简单，基本上只需要玩过MC，了解其中关于地图的一些概念就能够轻松操作这些软件来生成STL文件格式的文件再交给3D打印机打印。

### 第一步，生成.schematic文件

刚刚提到的Minecraft Structure Planner说白了就是用来建模的，它建立的模型可以导出成schematic文件格式，至于这个文件格式是什么可以看[这里](http://minecraft-zh.gamepedia.com/Schematic%E6%96%87%E4%BB%B6%E6%A0%BC%E5%BC%8F)。

<figure>
	<img src="{{ site.url }}/images/mc/planner.png" alt="Minecraft Structure Planner操作页面" height="400" width="400">
	<figcaption>Minecraft Structure Planner操作页面</figcaption>
</figure>

如果是要做像素风格的设计时候，记得在Structures下选择Pixel Art，然后就可以在右侧指定图片，然后在中间就可以去完成图片的像素风版本，之后再选择导出成schematic格式就可以了~这里有一点不太好就是要手动去临摹一遍原本的图片，当时也一直在找有没有什么工具可以直接把图片转换成.schematic文件省略掉这一步，很不幸的事情，当时没有找到，在写这篇文章的时候不小心找到了。。。。

其实当时做的时候应该算是找到过，[Spritecraft](http://www.diamondpants.com/spritecraft/)就可以做到这一点。不过要注意是要用Spritecraft Full而不是Free，当时以为Full是要付钱的，但似乎是Donate形式的，所以其实是可以免费得到Spritecraft的Full版本的。有了它事情就方便多了。

### 将模型放到地图上

接下来就是使用大名鼎鼎的Mcedit来把schematic文件中的模型放在地图文件中了。

<figure>
	<img src="{{ site.url }}/images/mc/mcedit.png" alt="mcedit操作页面" height="400" width="400">
	<figcaption>mcedit操作页面</figcaption>
</figure>

这一步有很多资料有详细的讲解，这里就不说了。

### 将MC地图导出为STL文件

这一步要用到Mineways，这个软件似乎在OS X平台是跑在wine上的，呃当然我也不确定，也不需要去管，似乎在使用过程中倒是没有什么大问题

<figure>
	<img src="{{ site.url }}/images/mc/mineways.png" alt="mineways操作页面" height="400" width="400">
	<figcaption>mineways操作页面</figcaption>
</figure>

呃，这个软件也非常简单，只需要选定水平范围，然后选定深度的范围，就可以根据选定的范围来导出STL文件，同时还可以指定Block的size来确定导出的模型的尺寸。最后拿到STL文件后你甚至都不需要下载什么专门的软件打开它，直接交给3D打印机或者淘宝找个服务提供商就可以直接打印了。

## 结

呃，虽然看上去绕了一大圈，但是其实操作都是很简单的。很适合有彩色3D打印机的时候玩玩，只有一种颜色实在是限制太大了Orz。