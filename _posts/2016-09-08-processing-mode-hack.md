---
layout: post
title: "Processing R Mode实现记录之测试"
description: 
headline:
modified: 2016-09-08
category: Processing
tags: [Processing]
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

最近在试着支持用R语言来使用Processing的库，有了[renjin](http://www.renjin.org/)的支持，这并不是特别困难，实现方式也是写一个Processing的Mode。但是在测试的时候遇到一些问题，app本身没有办法主动地扫描modes目录并建立目录列表。因此使用了一种比较Hack的手法，虽然有些Dirty，但是可以用。

解决问题的思路是这样的，因为Processing是有一个默认Mode的设定的，因此可以通过把默认的Mode修改成自己实现的Mode的方式来测试。具体的做法相对而言还算简单。

因为Processing的Mode是支持第三方的，所以是使用了反射的方法，在运行时来确定的。因此对于Processing的代码的修改就涉及的很少。整个流程是，先修改代码，将默认Mode指定为自己实现的Mode，然后编译app，因为编译好的app默认只有Java Mode，所以需要将自己实现的Mode拷贝到app的指定目录中，然后运行app即可。

## 修改代码

在修改代码阶段，只有[Base.java](https://github.com/processing/processing/blob/master/app/src/processing/app/Base.java)的两个函数需要修改。

```
  /** True if heavy debugging error/log messages are enabled */
  // static public boolean DEBUG = false;
  static public boolean DEBUG = true;

  void buildCoreModes() {
    /* Mode javaMode =
      ModeContribution.load(this, Platform.getContentFile("modes/JavaMode"),
                            getDefaultModeIdentifier()).getMode();
    */

    Mode javaMode =
      ModeContribution.load(this, Platform.getContentFile("modes/PythonMode"),
                            getDefaultModeIdentifier()).getMode();

    // PDE X calls getModeList() while it's loading, so coreModes must be set
    coreModes = new Mode[] { javaMode };
  }

  String getDefaultModeIdentifier() {
    // return "processing.mode.java.JavaMode";
    return "jycessing.mode.PythonMode";
  }
```

buildCoreModes函数指定了去哪个目录去获取Mode，而getDefaultModeIdentifier指定了Mode的类名。因为代码是先编译，然后再在运行时获取Mode的，所以需要先把代码修改成合适的目录和类名，然后编译出app。同时为了调试方便，建议把DEBUG置为true。

## Copy Mode to app

在得到新编译的app后，因为它的build.xml写死了只把默认的Mode拷贝到app的mode目录下，因此，如果需要真正地修改默认Mode，需要把自己写好的Mode目录拷贝到app的mode目录下，如果是OS X环境，就是`${WORKDIR}/build/macosx/work/Processing.app/Contents/Java/modes/`下。其中`${WORKDIR}`是processing代码所在的位置。


然后就可以了，如果Mode没实现错的话，就可以将app默认的Mode置为该Mode，否则会在标准输出流里报错。

之前在论坛上看到过其他更Hack的方法，比如先通过app下载好一个Mode，然后对这个Mode进行魔改。这样的方式就是比较难自动化。而通过新编译一个app，然后把默认Mode修改掉的方式，可以通过Ant的Build file来实现自动化，所以还相对要方便一些。
