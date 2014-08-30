---
layout: post
title: "Sublime Text2 Sidebar的字体大小修改"
description: 修改sublime text字体
headline: 
modified: 2014-08-30
category: 1080p
tags: [sublime text, font, 字体修改]
imagefeature: 
mathjax: 
chart: 
comments: true
featured: false
---

人生苦短，时间都浪费在调整字体上了~

## 吐槽

=-=15寸的1080p的屏幕真是奇葩的存在。windows系统下的字体显示实在是捉急的不行。sublime text的侧边栏在1080p下字小的有点吓人。于是去找了找怎么修改侧边栏的字体。最终功夫不负有心人，在[sublime text的官方论坛](http://www.sublimetext.com/forum/viewtopic.php?f=2&t=4799)上找到了解决方法。

## 解决方法

首先需要要找到`.sublime-theme`文件，一般如果没有对sublime做过修改的话是在`package`里的`Theme-Default`下的`default.sublime-theme`，然后就是把所有`class`名字是`sidebar_label`的声明里都追加一句`font.size": 15`，这样就可以啦~