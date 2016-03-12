---
layout: post
title: "在无显示器的环境下给Raspberry Pi装系统"
description: 
headline:
modified: 2016-03-12
category: 随笔
tags: [raspberry Pi]
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

Raspberry Pi 3 Model B，最近到手了，是托在hackshanghai 2014上认识的同学，现在在[knewone](https://knewone.com/)做事的鞠春利同学代购的，感觉自己最近花钱有些不知分寸，于是就把基本处于积灰状态的Raspberry Pi 2和Leap Motion都卖掉了。

上次Raspberry Pi是直接买了淘宝的bundle，所以基本没有涉及到装系统之类的事情，这次是图新鲜买了裸机，然后因为身边没有HDMI线，显示器也在学院的实验室里，就打算能不能不带图形化去装系统，后来发现，这样确实是可以的，国外也有了很多现成的解决方案。大概操作的逻辑是，设定为静默安装，这样只要给板子提供电源和网络环境，就可以完成安装。

只需要做一步就好了，把recovery.cmdline中原本的

```
 runinstaller quiet vt.cur_default=1 coherent_pool=6M elevator=deadline
```

改为

```
 runinstaller quiet vt.cur_default=1 coherent_pool=6M elevator=deadline silentinstall
```

然后把卡插入，等上一段时间就好了，我是从西区走到一餐浴室洗澡走回来，就发现可以ssh上去了。至于怎么找到Raspberry Pi的IP，我试过两种方法。一种是登录路由器，去看有哪些设备，分别分配到了哪些IP。第二种方法是用网线把电脑和Raspberry Pi连起来，然后用Wireshark去抓有线网卡来的包，就几个192.168.*.*的IP，一个个试一下就好了。