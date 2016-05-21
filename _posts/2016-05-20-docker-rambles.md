---
layout: post
title: "Docker与Hyper"
description: 
headline:
modified: 2016-05-20
category: 
tags: [docker]
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

每逢考试就要作死，谁都拦不住，还有大概一个小时就要去考国际经济法了，但是忽然想写一篇关于Docker的文章，从开始接触Docker到现在，也有大概两三个月的时间了，这段时间里比较多的时间花在了Docker和Golang上，有一些自己的看法。这篇文章不是介绍向，是随笔向，嗯。

## Docker

之前在CSP的课程上学了一些关于虚拟机的粗浅知识，知道了什么是Xen，什么是KVM，什么是QEMU，为什么Xen没有被Merge到内核里，为什么KVM可以用很少的代码就实现了跟Xen差不多的功能。当然也只是似懂非懂，毕竟没有认真听课。不过听懂了一个概念，那就是ABI(Application Binary Interface)和API(Application Programming Interface)这些不同的接口对应的不同的虚拟化手段，那Docker其实就是API级别的虚拟化手段，也被称作操作系统级别的虚拟化，说是这么说，但是跟其他的虚拟化技术而言，Docker实在是太简单了，半天就能大概摸清楚它的一些实现原理，不像之前的Xen，KVM等等，还会与硬件上的一些特性有关系。而且容器虚拟化，也不是Docker第一个做，之前的FreeBSD jails，Linux-VServer等等都是很早就有的，为什么Docker就一下火起来了呢？

很多人都说Docker只不过是把内核的一些特性，诸如cgroups，namespace稍微运用了一下，namespace还用的不是很妥贴，做了一层抽象与封装而已。但似乎Docker就是因为易用，简单才能够在这么短的时间内流行起来。其实从某种程度来说，工程师应该是不喜欢学习新的技术的，大家平时工作那么累，如果一项技术门槛特别高，而在可以预见的将来都不会派上用场，那必然不会有太大的动力去学这样一个东西。而如果一项技术，在学之前已经知道了它的作用与威力，感觉是分分钟可以用到实际中去的，而且学习的成本又非常低，那这项技术没有道理不火的，Docker大概就是这样吧。原本因为CSP留下的心理阴影，只要是跟虚拟化三个字沾边的，都给人一种盗梦空间的烧脑感，而这样的阴影被可爱的蓝鲸治愈了，因为对于使用者而言，着实太友好了一些。

## Hyper

不过最近在Docker之外，被一个叫做Hyper Container的东西吸引了。他们的主页是[www.hyper.sh](https://www.hyper.sh/)，是北京的一家创业公司的产品的样子。这家公司做的[hyperd](https://github.com/hyperhq/hyperd)是一个在虚拟机上运行Docker容器的东西，跟一般意义上的，在虚拟机上运行一个Docker Daemon然后再运行容器的概念不同。

<figure>
	<img src="{{ site.url }}/images/docker/hyper.png" alt="hyper架构图" height="500" width="500">
	<figcaption>hyper架构图</figcaption>
</figure>

其实现在我也不是太理解他们做了什么事情，但是看架构图可以发现，跟Docker相比，他们有一点很大的不同，就是Daemon程序不是直接运行一个容器，而是先启一个Instance，也就是虚拟机，然后在这个虚拟机里运行一个Pod，嗯对，在他们的概念里Pod是一等公民，跟k8s的概念比较类似。所以看上去是加了一层抽象，就是Pod，然后之前k8s只是简单地把Pod做成了share一个network的namespace，但其实Pod与Pod之间，没有什么隔离的感觉在里面，只是用传统的容器隔离的方式。而hyper做的事情感觉就是加了一层虚拟机，使得Pod之间做了传统的虚机来做隔离，这样在别的Pod导致内核崩溃的时候，其他Pod还能继续服务。

他们提出的概念是：

>HyperContainer is a Hypervisor-agnostic Docker Runtime that allows you to run Docker images on any hypervisor (KVM, Xen, etc.).

通过他们自己实现的内核和一个start的服务，就可以在虚拟机里直接去根据Docker的Image来运行容器。也就是他们自己所说的`HyperContainer = Hypervisor + Kernel + Docker Image
`。

感觉概念挺有意思的，最开始是在知乎上一个[回答](https://www.zhihu.com/question/35412725/answer/101715150)上知道了这样一个东西，然后就去看了看，还没有深入地去了解，等到毕设做完有时间的话再去看看吧。

## 结

哦，还有十几分钟就要考试了，愿原力与我同在。