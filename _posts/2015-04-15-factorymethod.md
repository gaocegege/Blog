---
layout: post
title: "Factory与Abstract Factory模式"
description: 
headline:
modified: 2015-04-15
category: design pattern
tags: [design pattern]
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

最近发现[Java设计模式](http://www.amazon.cn/Java%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F-%E5%8F%B2%E8%92%82%E8%8A%AC%E2%80%A2%E7%BA%A6%E7%BF%B0%E2%80%A2%E6%A2%85%E7%89%B9%E6%96%AF%E5%85%8B/dp/B0093O0V4E/ref=sr_1_6?ie=UTF8&qid=1429104781&sr=8-6&keywords=java%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F)这本书，很是不适合一般人看。里面基本全是UML类图，没有多少代码。而且基本一页一道习题，三百多页的书，真实内容其实很少，还看不懂。幸亏是图书馆借的，要是75块买来真是亏死。废话说完了。。。

# Factory Method

工厂模式，这个词听到过好多次了，今天才真正去学习它。感觉没什么很令人震撼的思想，可能越是有用的东西就越是朴素吧。工厂模式在我看来，就是说内化实例化的逻辑，对外表现统一。也就是在类在有继承等等的时候，可以通过工厂方法，得到正确的实例。我觉得[tutorialspoint](http://www.tutorialspoint.com/design_pattern/factory_pattern.htm)讲的比较简单清楚，主要是例子简单。其实就是说，根据参数或者内在的状态，是可以决定在工厂方法被调用的时候是应该返回什么类型的实例的。那这时候将这一段逻辑放在工厂方法里面，这样在外面看起来，只要调用这个方法，它就会返回不同类型的实例。

# Abstract Factory Method

抽象工厂模式，感觉像是工厂的工厂，我确实不太明白它与工厂模式的区别，我觉得都是一个东西啊，都是根据逻辑来动态返回正确类型的实例。还是觉得[tutorialspoint](http://www.tutorialspoint.com/design_pattern/abstract_factory_pattern.htm)讲的不错，大致就是把工厂类也抽象出来，成为一个继承的结构，那这个继承的结构中，根节点，也就是父类，就是抽象工厂。感觉上只是抽象层级高了一些，没有本质的变化啊，不知道想的对不对。

# Warning

课上听到一句，工厂可能是系统的瓶颈所在，主要是因为你是不知道工厂的实现是怎样的，如果工厂内部逻辑很复杂，在调用工厂方法产生实例的时候就会消耗很多资源，似乎确实是这样。