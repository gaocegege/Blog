---
layout: post
title: "如何在OS X 10.11的Terminal中使用shadowsocks"
description: 我要黑一发Green VPN
headline:
modified: 2015-11-25
category: 随笔
tags: []
imagefeature:
mathjax: false
chart:
comments: true
featured: false
---

今天在读CSP要求读的论文，[TaintDroid](http://appanalysis.org/tdroid10.pdf)。大概是一个在安卓设备上做Taint分析的工具，似乎挺有名的，看了demo感觉好有趣，就打算做来看看。但是马上就遇到了问题。

根据[其网站](http://appanalysis.org/download_4.1.html)上的做法，是需要用一个repo工具来下载在google上的repo，然后repo工具在OS X下的安装是使用brew来完成的。这似乎一切看起来都非常简单。但在install的过程中发现，repo工具本身也是在googlesource.com上的，因此要翻墙才能访问到。而不知是什么奇妙的原因，shadowsocks不能代理terminal中的访问。那么问题来了，到底如何在terminal中使用shadowsocks来翻墙呢。

主角是[proxychains](https://github.com/rofl0r/proxychains-ng)，看介绍proxychains大概是一个hook程序，会把所有的请求都转发给socks或者http的代理。有了这个工具，只需要简单的配置就可以实现在terminal中使用shadowsocks代理的美好愿望了。

## 在OS X 10.11之前的系统里

这里有一篇[shadowsocks的官方文档](https://github.com/shadowsocks/shadowsocks/wiki/Using-Shadowsocks-with-Command-Line-Tools)，就是用来教大家如何在terminal中使用shadowsocks的，这里还有一个[中译版](http://segmentfault.com/a/1190000002589135)，简单易懂，再次证明了shadowsocks大法好。

## OS X 10.11的坑

但是，单单做到文档里说的这些，在OS X 10.11里面是不会work的。关于原因，这里的[一个issue](https://github.com/rofl0r/proxychains-ng/issues/78)可以比较好地说明问题。大概就是说OS X的新版本引入了一个新机制，SIP。全名叫做System Integrity Protection，[苹果官方的解释](https://developer.apple.com/library/prerelease/mac/releasenotes/MacOSX/WhatsNewInOSX/Articles/MacOSX10_11.html)是

>A new security policy that applies to every running process, including privileged code and code that runs out of the sandbox. The policy extends additional protections to components on disk and at run-time, only allowing system binaries to be modified by the system installer and software updates. Code injection and runtime attachments to system binaries are no longer permitted.

知乎上的[这个问题](http://www.zhihu.com/question/31116473)里面有对SIP入门的介绍。大概就是说就算是Root权限也不能对一些二进制进行修改，这些二进制是在/System，/bin，/sbin，/usr (except /usr/local)中的。这就影响了proxychains的作用范围，不在上述目录中的二进制可以使用proxychains，而在其中的就不行了，悲剧的是ping，wget等等命令似乎都在这些目录中。那怎么解决这个问题呢。

最笨的方法，把所有命令都放在~/bin里，把~/bin放在路径里，这种方法就不说了，那还有更加简单粗暴的方法就是关闭SIP。关闭SIP的步骤可以参考下[这里](http://osxdaily.com/2015/10/05/disable-rootless-system-integrity-protection-mac-os-x/)，大概分为三步：

1. 重启Command + R进入recovery mode
2. 左上角通用工具选择终端
3. csrutil disable; reboot回车

然后在重启后的终端里输入`csrutil status`，会看到：

	System Integrity Protection status: enabled (Custom Configuration).

	Configuration:
		Apple Internal: disabled
		Kext Signing: disabled
		Filesystem Protections: disabled
		Debugging Restrictions: disabled
		DTrace Restrictions: disabled
		NVRAM Protections: disabled

	This is an unsupported configuration, likely to break in the future and leave your machine in an unknown state.

然后proxychains就可以正常工作了，至于说的`leave your machine in an unknown state.`，只能寄希望于Time Machine了。

# 结

故事的最后，黑一下Green VPN。本来没打算就这样用shadowsocks的，想直接买个VPN，简单方便。正好之前同学推荐了Green VPN，就买了一个月想先试试。但是试了一个小时没成功，就去找客服问问是不是设置之类的做错了。但是那客服哥们先问了我是玩游戏还是浏览网页，我说是想代理整个系统的访问，然后具体说了说其实就是想用终端下载点东西，问他怎么在OS X系统里面设置。但是那哥们二话不说直接说做不到就消失了。接下来我连着问了好多次，结果一个回复没有，我特么以后再买这种服务就是XX。。。