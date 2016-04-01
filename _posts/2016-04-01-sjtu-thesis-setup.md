---
layout: post
title: "交大论文latex模板环境搭建"
description: 
headline:
modified: 2016-04-01
category: 随笔
tags: [随笔]
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

最近准备开始着手毕设论文的事情了，首先的首先就是先决定是用word写还是用latex，作为一个假装自己很厉害的程序员🤔，感觉很有必要学习一下latex。于是就进入配环境的噩梦中无法自拔，latex真的真的非常不友好=-=

决定使用latex后，就需要选择一个latex的模板，对于本科的毕业论文来说，一共有两个选择，一个是用[上海交通大学毕业设计论文智能管理系统](http://bysj.jwc.sjtu.edu.cn/shownews.aspx?newsno=0/r29o3qDXFnM/Hwnz1p4A....)上提供的latex模板，另一个是用[github.com/weijianwen/SJTUThesis](https://github.com/weijianwen/SJTUThesis)，前者配环境配了一万年，最后还是以失败告终，所以只好选择了后者。后者在Github上已经有了接近300个star，而且有版本控制和构建脚本，十分之方便。

如果之前像我一样完全没有使用过latex，机器上也没有latex的环境，那从零开始配这样一个可以编译latex的环境在我看来实在是麻烦。主要的问题在于各种包和各种字体，latex似乎有一个包管理工具，tlmgr，但感觉并不是非常友好，`sudo tlmgr update --all`后还是会遇到各种各样的依赖报错。字体的话，只有一个getnonfreefonts的脚本，似乎是可以自动化地下载几个少的可怜的字体，基本等于没有。作为一个萌新，感觉latex的曲线太陡峭了。

所以在遇到了交大官方给的模板里的一万个编译报错时，果断地选择了放弃，转移到了github上的那个模板。github上的模板就要简单好多好多，只需要安装tex live再加上一点点字体后就可以使用了。怕自己之后忘了，这里就记录下配置的流程。

### 安装Tex live

Tex live在[texlive 安装指南](https://github.com/weijianwen/SJTUThesis/wiki/texlive-%E5%AE%89%E8%A3%85%E6%8C%87%E5%8D%97)里有比较清楚的阐述，在OS X下的话推荐下载MacTex，然后无脑下一步就好了。安装完后，需要在.bashrc或者如果是用zsh的话在.zshrc里把texlive的二进制目录加到PATH下：

```
export PATH="/usr/local/texlive/2015/bin/x86_64-darwin:$PATH"
```

最后source下.bashrc或者.zshrc，或者重启terminal，这样latex就配置好了。接下来，为了编译交大的模板，需要装一些字体。

### 安装字体

安装字体，有两个方法，一个是装在系统上，然后让latex用系统的字体，或者直接装在latex里。前者比较简单，交大的模板用到了五种字体，中英文分别依赖 Adobe 的四套简体中文字体和 TeX Gyre Termes 西文字体。这些字体，可以在[github.com/mingchen/mac-osx-chinese-fonts](https://github.com/mingchen/mac-osx-chinese-fonts)和[http://www.gust.org.pl/projects/e-foundry/tex-gyre/termes](http://www.gust.org.pl/projects/e-foundry/tex-gyre/termes)下载到，安装的话就双击otf就好了的样子。

### 最后

最后，在目录下`make validate`下，看下是不是真正可以编译了，这样之后应该是没有问题了。对了，有一个小坑，没事不要tlmgr update所有的包，会出现各种奇葩的问题，别问我怎么知道的，全是泪。。