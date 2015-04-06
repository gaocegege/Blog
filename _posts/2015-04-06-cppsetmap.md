---
layout: post
title: "C++ Associative Containers"
description: C++ STL
headline:
modified: 2015-04-06
category: 
tags: [c++]
imagefeature:
mathjax: true
chart:
comments: true
featured: true
---

# C++ Associative Containers

这个应该如何翻译呢，应该是关系型容器吧。这一类容器的特点是，首先是关系，然后是有序的。这类容器都与集合，二元关系等等有关系，所以叫做这个名字吧Orz。

Associative Containers共有四种，分别是Set，Map，Multiset，Multimap。

## Set

Set，集合。最大的特点是集合内的元素不允许重复，同时不可修改。与其在数学上的定义类似。因为要保证有序，所以内部是使用平衡二叉树实现（红黑树）。

## Map

Map，中文应该是什么，大概是映射吧。是一个存放二元关系`<key, value>`的容器。同一个key对应同一个value，不允许key的重复。Set可以存放一元关系，而Map只能存放二元关系对。因为要保证有序，所以内部是使用平衡二叉树实现（红黑树）。

## Multiset

之前提到Set不允许重复，那Multiset就是允许重复的Set。

## Multimap

同样，Map不允许同一个key对应多个value，那Multimap就可以这样。

## 区别

如果是存放二元关系，Set与Map是有一些类似的地方的。下面的例子就是利用Set存放`pair<int, int>`，Map也是存放`int, int`的键值对。

	#include <iostream>
	#include <set>
	#include <map>

	using namespace std;

	int main(int argc, char const *argv[])
	{
		// test case
		pair<int, int> p1(1, 1); 
		pair<int, int> p2(1, 2);
		pair<int, int> p3(1, 1);

		// set
		set< pair<int, int> > s; 
		s.insert(p1); 
		s.insert(p2); 
		s.insert(p3);

		// map
		map<int, int> m; 
		m.insert(p1); 
		m.insert(p2);
		m.insert(p3); 

		// multiset
		multiset< pair<int, int> > ms;
		ms.insert(p1); 
		ms.insert(p2);
		ms.insert(p3);

		// multimap
		multimap<int, int> mm;
		mm.insert(p1);
		mm.insert(p2);
		mm.insert(p3);

		// print
		cout << "Set size = " << s.size() << endl; 
		cout << "Map size = " << m.size() << endl;
		cout << "MuitiSet size = " << ms.size() << endl; 
		cout << "MultiMap size = " << mm.size() << endl;
	}

上面代码的输出是这样的~

<pre>
Set size = 2
Map size = 1
MuitiSet size = 3
MultiMap size = 3
</pre>

首先看Set与Map的区别。Set在构建模板类的时候参数是`pair<int, int>`，而Map是`int, int`，其实这里就可以看出两个容器的区别了。Set是把关系当做一个整体来存放，Map是将Key当做主体，Value只是一个属性，来存放。看输出也会知道，`<1, 1>`与`<1, 2>`对于Set而言是两个不同的数据，而对于Map而言，他们的Key都是1，是相同的，所以在insert`<1, 2>`的时候，因为已经存在Key为1的数据，所以insert并不成功。但是也不会报错，只是没有起到作用。

其次，Set与Multiset的区别，就在于，连续insert两次`<1, 1>`，Set不会存放两个相同的数据，而MultiSet允许这样。

然后Map与Multimap的区别，首先，Multimap允许同一个Key对应不同Value，另外，同样发现，相同Key同时相同Value也允许重复。在二元关系上，似乎Multimap与MultiSet的表现是一致的。