---
layout: post
title: "Spring boot中使用QueryDSL"
description: 寒假第一天，就开始为了生计努力奔波了
headline:
modified: 2016-01-20
category: java
tags: [java, spring]
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

寒假开始了，目测要进入一段小规模的高产期。终于有时间开始做一些之前没时间做的事情了，虽然假期里需要继续做软件工程的项目，还有自己的毕业设计，但是估计还是可以有时间来写一点自己想写的东西吧，但愿是这样。

最近在用Spring boot写一个Web方向的应用，涉及到比较复杂的Sql查询之类的内容，这个时候就会涉及到，是直接裸写查询语句，还是用一种更加方便的解决方法。

俗话说得好，任何计算机方面的问题都可以通过增加一层抽象来解决。那这个问题也是这样来做的。既然裸写查询语句非常辛苦，那就可以在其上构建一层抽象，用Java来描述查询条件，这层抽象就是[QueryDSL](http://www.querydsl.com/)。

然而，在添加QueryDSL支持的时候，遇到一点问题，主要是Spring boot跟QueryDSL之间集成的坑。在Spring boot data jpa下使用QueryDSL，是需要在repository层扩展一个接口，`org.springframework.data.querydsl.QueryDslPredicateExecutor`。在这个接口中，使用到了`com.mysema.query.types.Predicate`。而因为，QueryDSL最新的版本4.X.X下，这个类的路径已经变成了`com.query.types.Predicate`，所以如果用最新版本的QueryDSL，就会一直报错有一些类找不到。就是因为在`org.springframework.data.querydsl.QueryDslPredicateExecutor`中使用了在新版本中不存在的类。

这个问题，有一个非常非常简单的解决办法，就是，用老版本的QueryDSL。老版本中能用的最新的版本是3.7.0。好，于是就没有其他问题了。