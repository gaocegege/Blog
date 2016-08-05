---
layout: post
title: "Processing 2踩坑之旅"
description: 
headline:
modified: 2016-08-05
category: 体验
tags: [踩坑]
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

今天在尝试各种可以画图的工具，从R language到Processing等等，需求是在上海市的地图上画出一个聚类的效果。因为之后参加数学建模的比赛可能也有这样的需求，就着重尝试了一下。首先是Tableau Public，因为本身是商用软件，如果可以画的话就省了很多时间。但发现功能有点弱，只有通过数据来画，Mock起来不是那么简单，然后本身功能受限，于是放弃了。然后尝试了Plotly，是一个蛮有趣的画图组件，但是地图只对美帝比较友好，上海市的轮廓实在是，不能看。最后找来找去，想试试Processing。然后就找到了一个比较有名气的库，叫做Unfolding。但很可惜这个库只能在Processing 2上运行，所以就开始重新装Processing 2，过程中遇到了一万个坑。

一开始下载下来Processing 2的时候，我内心是毫无波动的。像这样有名气而且使用者众的开源软件，一定被打磨的非常好用了。双击打开，闪退。嗯这大概是电脑太久没有重启了吧。嗯没事，重启再来一次，还是闪退，这就有点尴尬了。嗯，记得Processing是用Java写的，是不是Java的版本之类的出了问题，但作为一个Java半小白，也不知道到底应该怎么做，就试试换成JDK 1.7再来一遍吧。

闪退妥妥的，这就有点有趣了。在应用程序里直接打开应用，是看不到报错的，于是拿出了命令行，直接执行二进制，终于看到了报错。

```
Exception in thread "AWT-EventQueue-0" java.lang.UnsupportedClassVersionError: com/sun/jdi/VirtualMachine : Unsupported major.minor version 52.0
	at java.lang.ClassLoader.defineClass1(Native Method)
	at java.lang.ClassLoader.defineClass(ClassLoader.java:800)
	at java.security.SecureClassLoader.defineClass(SecureClassLoader.java:142)
	at java.net.URLClassLoader.defineClass(URLClassLoader.java:449)
	at java.net.URLClassLoader.access$100(URLClassLoader.java:71)
	at java.net.URLClassLoader$1.run(URLClassLoader.java:361)
	at java.net.URLClassLoader$1.run(URLClassLoader.java:355)
	at java.security.AccessController.doPrivileged(Native Method)
	at java.net.URLClassLoader.findClass(URLClassLoader.java:354)
	at java.lang.ClassLoader.loadClass(ClassLoader.java:425)
	at java.lang.ClassLoader.loadClass(ClassLoader.java:412)
	at sun.misc.Launcher$AppClassLoader.loadClass(Launcher.java:308)
	at java.lang.ClassLoader.loadClass(ClassLoader.java:358)
	at java.lang.Class.forName0(Native Method)
	at java.lang.Class.forName(Class.java:190)
	at processing.app.Base.initRequirements(Base.java:252)
	at processing.app.Base.createAndShowGUI(Base.java:172)
	at processing.app.Base.access$0(Base.java:149)
	at processing.app.Base$1.run(Base.java:143)
	at java.awt.event.InvocationEvent.dispatch(InvocationEvent.java:312)
	at java.awt.EventQueue.dispatchEventImpl(EventQueue.java:733)
	at java.awt.EventQueue.access$200(EventQueue.java:103)
	at java.awt.EventQueue$3.run(EventQueue.java:694)
	at java.awt.EventQueue$3.run(EventQueue.java:692)
	at java.security.AccessController.doPrivileged(Native Method)
	at java.security.ProtectionDomain$1.doIntersectionPrivilege(ProtectionDomain.java:76)
	at java.awt.EventQueue.dispatchEvent(EventQueue.java:703)
	at java.awt.EventDispatchThread.pumpOneEventForFilters(EventDispatchThread.java:242)
	at java.awt.EventDispatchThread.pumpEventsForFilter(EventDispatchThread.java:161)
	at java.awt.EventDispatchThread.pumpEventsForHierarchy(EventDispatchThread.java:150)
	at java.awt.EventDispatchThread.pumpEvents(EventDispatchThread.java:146)
	at java.awt.EventDispatchThread.pumpEvents(EventDispatchThread.java:138)
	at java.awt.EventDispatchThread.run(EventDispatchThread.java:91)
```

我猜的还是很准的嘛，果然是Java版本的问题，但是为什么通过设置环境变量变更Java版本不管用呢，难道Processing自己内置了<del>三个XX</del>一个Java的运行环境，所以自己换是没用的？那是时候看看Info.plist了，其中有一个很有趣的地方。

<figure>
	<img src="{{ site.url }}/images/processing2/java.png" alt="info" height="500" width="500">
	<figcaption>Info.plist</figcaption>
</figure>

那就是Java的运行时是写在这里的，然后之前写的是1.7.XXX，之后被我改成了跟Processing 3一样的字符串，然后把在Processing 3里面的Java环境拷贝到了Processing 2里面。目录是`/Applications/Processing2.app/Contents/PlugIns`，这个PlugIn是真的违和。

然后继续执行命令行，发现可以了唉。但是，随便运行一段程序，会报错：

```
Annotation processing got disabled, since it requires a 1.6 compliant JVM
/tmp/sketch_131213a3040094527895471164temp/sketch_131213a.java:1: error: The type java.util.Map$Entry cannot be resolved. It is indirectly referenced from required .class files
import processing.core.*;
^
1 problem (1 error)
```

一路上充满了坑，这个时候就想放弃了。还好，这个问题谷歌到了，在[一个不知道是什么的网站](http://quality-discuss.openjdk.java.narkive.com/wMgetNSu/processing-2-1-fails-to-compile-all-of-its-projects-using-jdk8-ea-b119-error-the-type-java-util-map-)上。回答是这样的：

```
This have been fixed in eclipse ecj upstrem.

Updating java/mode/ecj.jar inside Processing 2.1
to eclipse ecj version 4.3.1
http://www.eclipse.org/downloads/download.php?file=/eclipse/downloads/drops4/R-4.3.1-201309111000/ecj-4.3.1.jar
fixes this issue.

Cheers
Xerxes
```

简单来说就是要把`/Applications/Processing2.app/Contents/Java/modes/java/mode`下的ecj.jar替换掉。替换掉之后就发现可以用了，不知道以后还会不会被坑。

至于为什么一开始就闪退，换了JDK 1.8才可以，猜测是因为是用1.8的编译器编译的字节码，然后妄图用自带的1.7来解释，最后导致了悲剧的发生。不过也不知道对不对，总之这样之后就可以用了。
