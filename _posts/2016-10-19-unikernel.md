---
layout: post
title: "CSP课堂笔记之UniKernel"
description: 
headline:
modified: 2016-10-19
category: csp
tags: [csp]
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

## Background

CSP是上海交通大学软件学院的研究生课程，因为之前大四上的时候没好好上，特意重修了一遍，这里是重修时候课上的一些记录。

## 正文

### Monolithic Kernel

相信只要是接触过计算机的，一定对『内核』这两个字不会陌生。只要在使用电脑的时候，都离不开跟内核打交道。无论是Windows还是Linux等等，这些寻常使用的操作系统，都是用内核和管理和使用硬件的。

在这其中，最有名的是Linux Kernel，最早是由Linus实现的。看到这个标题还会点开的，应该都是听说过Linux Kernel的吧。它是一个典型的Monolithic Kernel，也就是我们说的宏内核。

Monolithic，词典义是『单一的，庞大的』，简单理解，就是内核的所有功能，从文件系统，到内存管理，到CPU调度，等等等等，都放在内核态中。这样做有一个很大的好处，那就是所有这些功能都在同一个地址空间下，大家做通信会非常方便，而且通信的成本肯定也是低的，实现起来会快糙猛一些。就是很莽很厉害。

但是，这样也会导致一些其他问题。我觉得最大的问题就是代码复杂度会提高。Linux Kernel的代码量太美不看。同时，这样也会导致容错性不是很好，只要一个地方出了问题，会导致整个Kernel都挂掉。

### Micro Kernel

那既然Monolithic Kernel有这样的问题，做研究的人一定不会放过这样的好机会，于是就有了微内核的概念。所谓微内核，是指内核只提供最必要的功能，比如IPC，内存管理，CPU调度等等。而其他，诸如文件系统，网络IO等等，都放在用户态来实现。

这样做的好处首先是内核变小了，内核是常驻内存的，小了自然就节约了内存的空间。但是，这样的性能就会不如很莽很厉害的Monolithic Kernel要好，因为IPC通信的overhead还是有一些的。

### Hybrid Kernel

那既然Micro Kernel和Monolithic Kernel都有问题，能不能把两个结合一下，互相中和呢。

```
PPAP (Kernel Version)
I have a Monolithic Kernel.
I have a Micro Kernel.
Bow!
Hybrid Kernel!
```

这大概是研究的惯用套路，一个事情有两种极端的做法，然后中和一下，就有了第三种做法，公有云，私有云，混合云也是这样的套路，呃扯远了。那Hybrid Kernel就是把一部分不常使用的内核模块，或者是原本需要的时间就很长，因此IPC的overhead看起来就不是那么夸张的功能，移出内核，而其他的就会放在内核里。

<figure>
	<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/OS-structure2.svg/800px-OS-structure2.svg.png" alt="Hybrid Kernel" height="700" width="700">
	<figcaption>Hybrid Kernel</figcaption>
</figure>

Windows就是这样的内核，当然，这个是听别人说的，不是很懂他们是怎么看得到Windows的内核的，应该是论文吧，嗯。

### ExoKernel

看上去，内核已经被研究人员们研究地没得玩了。但ExoKernel又是另外一种内核，跟前面的几种都有不同。而且ExoKernel的风格，感觉上跟Xen，kvm这样的VMM有很大程度的相似，包括某些部分的实现，比如内存管理上。

之前说到的Monolithic Kernel也好，Micro Kernel也好，它们对资源的保护和管理都是在内核里去做的，也就是说，它们都是先对硬件做抽象，然后向上不直接暴露硬件，而是暴露硬件的抽象。一个例子，硬盘是硬件设备，但是我们的应用程序看到的是一个个的文件，文件本身就是一种抽象。而应用程序，是没办法直接操作硬件的，只能跟操作系统提供的抽象打交道。

那这样无疑是使得写应用的程序员不需要关心硬件，但是对于一些应用而言，其实是不好的。有一部分应用，就是需要跟硬件直接打交道。课上夏老师举的例子，是说数据库，MySQL，特别希望自己能够直接跟磁盘来交互，这样可以精确地确定它的索引等等文件的存储位置，来针对硬件来做优化。

那这样的需求，之前的内核都是没办法满足的。于是，ExoKernel就被提了出来。Exokernel的设计思路是尽可能减少抽象层次，允许应用程序直接访问硬件，而ExoKernel只负责保护和分配系统资源。应用程序过来请求资源，Exokernel看看资源是否空闲，如果空闲，直接交给应用，至于应用怎么访问是它自己的事。

ExoKernel分离了对硬件的使用和保护，使得应用程序可以直接使用没有经过Kernel抽象的硬件，就很好很强大。但是这样又有了其他的问题，那如果一个应用想发个HTTP请求，总不能先自己实现一套网络栈吧。于是，LibOS的概念就出现了

至于实现，其实有很多地方跟Xen很像，比如说都会用Software-defined TLB来做内存控制，就是在Flush TLB后，触发TLB Miss就会trap到ExoKernel，这个时候会先检查合法性，然后再填适当的缓存项到TLB中。要是没有Software-defined TLB就用页表来做。LibOS只能读，不能写自己的页表，所有对页表的写，都会trap到ExoKernel，然后ExoKernel会在这次trap中做检查，跟Software-defined TLB差不多，只是在不同层次的实现，但实现方式都是trap的方式。等等，还有很多地方。

#### LibOS

所谓LibOS，全称是Library Operation System。LibOS提供对于硬件的抽象，与用户代码编译成一个二进制，在同一地址空间。而且LibOS可以修改定制，来适配上层用户对硬件的具体需求，如控制物理内存的相邻等等。

<figure>
	<img src="{{ site.url }}/images/unikernel/exokernel.png" alt="ExoKernel" height="500" width="500">
	<figcaption>ExoKernel</figcaption>
</figure>

这样，不仅简化了内核的设计，也使得应用可以针对硬件做优化。但是，缺点是内核里没有进程调度，所以没有真正的多进程，而是靠Kernel来进行资源的分配。

### UniKernel

Unikernel是一种LibOS，它有着自己的哲学，那就是一个操作系统应该只有一个进程，内核和应用都在一个地址空间内。这样的好处就是，可以使得这个操作系统，或者说应用，非常地快。因为操作系统所有的资源都是这个应用的，而且所有对象都在一个地址空间里。还安全，相当于是可以剪裁原本的Monolithic Kernel，抛弃掉不用的功能，只把需要的硬件抽象Library编译到二进制里面。

有这么多好处，不是它火的关键，最关键的是云计算的流行。Unikernel可以直接运行在Xen上，而且不像传统OS那样，它小，而且安全，还快，简直就是天生为云计算而生的。从某种程度而言，是云计算中理想的Guest OS。

不过它也有一个广受诟病的缺点，就是没办法调试，不过我觉得这个倒不是关键，因为在开发的时候可以不用UniKernel，而在生产环境中再编译出UniKernel再去部署。还有就是硬件支持比较困难，会导致Library的碎片化，这个问题还挺严重的，就像安卓一样，不知道有没有解。

UniKernel从某种程度而言，冲击了容器的地位，但是其实容器也是可以跟UniKernel一起来用的：

<figure>
	<img src="{{ site.url }}/images/unikernel/docker-on-unikernel.png" alt="Docker on UniKernel" height="500" width="500">
	<figcaption>Docker on UniKernel</figcaption>
</figure>

尤其是现在有了runc，使得两者的结合更加明朗了。