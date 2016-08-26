---
layout: post
title: "Dockercraft代码导读"
description: 
headline:
modified: 2016-08-26
category: Docker
tags: [Docker]
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

[Dockercraft]: https://github.com/docker/dockercraft

最近生活发生了很大的变化，似乎对代码的热情有所降低，也感觉到脑子越来越不好使了，这真是个悲伤的故事。希望能够赶紧调整好状态=-=

今天的文章是关于[Dockercraft][Dockercraft]的，这个项目是一个非常非常非常有趣的玩意。不过要想了解它，首先要知道Docker是什么。不了解Docker的先去谷歌下吧~下面的文章都是建立在有使用过Docker的基础上来说明的。

[Dockercraft][Dockercraft]说起来很简单，就是在Minecraft中把玩Docker的一个Minecraft服务器。随着Minecraft被微软爸爸收购，感觉是有越来越火的趋势。而通过[Dockercraft][Dockercraft]，玩家可以在Minecraft中启动或停止一个Docker容器，而Docker容器会以一个N*N的方块房子的方式显示在玩家面前，而且会使用开关等Minecraft中的工具提供基本的容器停止等功能，对于码农来说是一个蛮有趣的服务器。

[Dockercraft][Dockercraft]的代码本身非常的简练，因为其最吸引人的地方是跟Docker的交互，所以着重看了看这部分的代码，读起来大概也就半小时就可以完全理解了。总体而言有两个组件，一个是负责跟Docker打交道的代理服务器，使用Golang实现，另一个是[Dockercraft][Dockercraft]自身的游戏服务器，使用Lua实现。

负责跟Docker打交道的goproxy代理服务器，它其实是有两个作用，一个是接受来自Lua服务器的关于列出所有容器等等与Docker有关的请求，以及接受来自Docker的事件，以HTTP请求的方式通知到Lua服务器。因为是跟游戏有关的服务，所以所有的操作都是异步来做的。

```
url.Values{
	"action":    {"containerInfos"},
	"id":        {id},
	"name":      {name},
	"imageRepo": {imageRepo},
	"imageTag":  {imageTag},
	"running":   {strconv.FormatBool(info.State.Running)},
	}
```

上面是goproxy发送给Lua服务器的数据格式，是在[Dockercraft][Dockercraft]中需要的容器相关的信息，而在获得容器列表的操作中，是以多个单容器HTTP请求的方式通知到Lua服务器的。

而Lua服务器中，跟goproxy的交互是写在一个[插件](https://github.com/docker/dockercraft/blob/master/world/Plugins/Docker/docker.lua)，该插件逻辑也非常简单，使用了非常常见的队列的方式来进行更新方块的调度。（其实没什么调度，就是一个队列而已）队列中的每一个元素是一个更新动作，可以是往地图中插入一个方块等等。

而什么时候执行更新动作，执行的频率是怎么样的，是由Hook住的Tick事件的Handler来决定的。

```
-- Tick is triggered by cPluginManager.HOOK_TICK
function Tick(TimeDelta)
	UpdateQueue:update(MAX_BLOCK_UPDATE_PER_TICK)
end
```

MAX_BLOCK_UPDATE_PER_TICK是一个定义的常量，决定了一次Tick可以更新的最大的方块数。

那来看一下一个玩家在加入了[Dockercraft][Dockercraft]游戏服务器会发生什么。首先，游戏中的Docker插件会向goproxy发送获取所有容器信息的请求，请求会立刻返回，当goproxy处理完这个请求后，会将所有容器的信息发送到Docker插件中，方式也是HTTP请求。而在Docker插件这边，所有请求都会变成一个个插入方块的更新请求，放到更新队列里，每当一个Tick被触发时就会处理更新队列里的更新请求。

因为[Dockercraft][Dockercraft]非常简练，所以我也基于这个项目实现了一个[Dronecraft](https://github.com/gaocegege/dronecraft)。[Drone](https://github.com/drone/drone)是一个基于Docker的CI工具，因为之前毕设的关系对它的源码还算了解。[Dronecraft](https://github.com/gaocegege/dronecraft)将原本[Dockercraft][Dockercraft]中的容器替换成了构建，每次一次代码提交或者是PR都会触发一次构建，然后就会在Minecraft游戏中建立一个小房子。这个项目还只是实现了一个Demo，估计不会再维护下去了（摊手）