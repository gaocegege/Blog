---
layout: post
title: "更改Chrome Developer Tools的字体"
description: 修改chrome字体的方法
headline: 
modified: 2014-08-29
category: 1080p
tags: [1080p, chrome, chrome developer tools]
imagefeature: 
mathjax: 
chart: 
comments: true
featured: true
---

本子是15寸的1080p的屏幕，导致chrome F12的工具里字特别小，于是找了找修改大小的方法。

## 位置

我的系统是`win8.1 64bit`，chrome的版本是`38.0.2125.24 dev-m (64-bit)`

改动是针对Custom.css进行的，文件位置是在`C:\Users\<user>\AppData\Local\Google\Chrome\User Data\Default\User StyleSheets`，至于linux下是在`~/.config/chromium/Default/User StyleSheets`

##修改

win下的修改如下

	body.platform-windows .monospace, body.platform-windows .source-code {  
        font-size: 16px !important;  
        font-family: Consolas, Lucida Console, monospace;  
    }

linux下

    body.platform-linux .monospace, body.platform-linux .source-code {  
    	font-size: 16px !important;  
    	font-family: dejavu sans mono, monospace;  
	}

font-size是字体大小，font-family是字体。

## 更多

你甚至可以改变developer tool的代码主题，
[个性化你的Chrome开发者工具代码主题](http://be-evil.org/custom-your-chrome-inspector-code-theme.html)。

看起来特别虎！

嗯，就是这样