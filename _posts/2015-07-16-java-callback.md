---
layout: post
title: "Java如何实现Callback"
description: 了解Java如何实现callback
headline:
modified: 2015-07-17
category: java
tags: [callback, java]
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

## 起因

最近来到了支付宝杭州做Java研发的实习，进组后马上就去了一个项目组，开始接触项目代码。一周做下来感觉收获还是挺大的，见到了很多新奇的模式，实现等等。不过确实也挺辛苦的，很少能挤出时间来学习学习新知识。周四的时候今秋给我和虎二科普了下关于Callback的Java实现方式。以前用CPP或者函数式的时候，都没有在意过这一块。CPP都是直接函数指针，粗暴地解决。函数式都可以把函数作为参数，也不存在什么问题。到了Java的时候，必须要完全用面向对象的问题去解决这个问题，还是遇到了一些障碍的。今晚利用实习结束的时间，忙里偷忙地学习了一下这方面的内容。

## 从头谈起

### Java Interface

首先，需要讨论下Java Interface。接口是C++中没有的概念，与之前学的Scala中的trait有些类似。从语言语义的角度，Interface具有类型的功能，跟类是有些相像的，但同时接口不能包含实现，其中的方法都是抽象方法。同时还不能有自己的非静态成员变量。因此，感觉在语义上，接口是跟类等价的东西。但两个东西还是有一些不同的。

就我今晚的尝试来看，最大的不同，是在实例化的时候。比如我们定义如下的一个接口：

	interface Index {
		public void a();
	}

在InterfaceTest类中，我们实例化两个Index接口类型的变量：

	class InterfaceTest {
		public static void main(String[] args) {
			Index i = new Index() {
				@Override
				public void a() {
					System.out.println("end back!!!");
				}
			};
			Index j = new Index() {
				@Override
				public void a() {
					System.out.println("end back!!!");
				}
			};
		}
	}

在编译的时候，InterfaceTest会编译产生三个字节码文件，分别叫做InterfaceTest，InterfaceTest$1，InterfaceTest$2。用javap去看他们的编码，会发现InterfaceTest是这样的：

<pre>
	Compiled from "TestInterfaceTest.java"
	class TestInterfaceTest extends java.lang.Object{
	TestInterfaceTest();
	  Code:
	   0:	aload_0
	   1:	invokespecial	#1;
	   4:	return

	public static void main(java.lang.String[]);
	  Code:
	   0:	new	#2; //class TestInterfaceTest$1
	   3:	dup
	   4:	invokespecial	#3;
	   7:	astore_1
	   8:	new	#4; //class TestInterfaceTest$2
	   11:	dup
	   12:	invokespecial	#5; //Method TestInterfaceTest$2."<init>":()V
	   15:	astore_2
	   16:	return

	}
</pre>

而InterfaceTest$1和Interface$2内容是基本一致的（除了类名）：

<pre>
	final class TestInterfaceTest$2 extends java.lang.Object implements Index{
	TestInterfaceTest$2();
	  Code:
	   0:	aload_0
	   1:	invokespecial	#1; //Method java/lang/Object."<init>":()V
	   4:	return

	public void a();
	  Code:
	   0:	getstatic	#2; //Field java/lang/System.out:Ljava/io/PrintStream;
	   3:	ldc	#3; //String end back!!!
	   5:	invokevirtual	#4; //Method java/io/PrintStream.println:(Ljava/lang/String;)V
	   8:	return

	}
</pre>

其实可以看出两个问题，一个是，每次接口被new构造出来的时候，都会产生一个final class，这个class会继承接口。所以在字节码层，实例化接口其实最后还是用实例化实现接口的类来实现的。这个不是运行时的行为，是在编译的时候就确定了的。另一个问题，就是在我们的例子中，两次对接口的实例化其实是一模一样的，但Java还是会产生两个final class。这说明Java没办法知道两个实例化操作中的接口实现是否是等价的，这也符合我的预期。如果Java可以从语义的角度判断等价，那就有点黑科技了。

## Callback

Callback就是回调，举例说明这个过程，比如A调用了B的b方法，那b方法如果包含对A中实现的逻辑的调用，这个过程就被称作回调。Leap Motion的Javascript API就是基于这样的回调的，每当Leap Motion的控制器拿到一帧手部的运动信息，就会回调以参数形式传给它的函数，函数中可以封装基于手部运动信息的一些操作，比如根据手的位置更新画布等等。用函数式的语言去描述，大概就是：

	func a() {
		// some operations
		b(lambda() {
			// callback func
			})
	}

	func b(f: void -> Unit) {
		//some operations
		f();
		// some operations
	}

逻辑就是这样的。

## Callback in Java

用Interface，我们可以比较简单的实现Callback：

	interface CallBackUnit {
		public void callbackFunc();
	}

	class CallBacker() {
		public void b(CallBackUnit callBackUnit) {
			// some operations
			callBackUnit.callbackFunc();
			// some operations
		}
	}

	class CallBacked() {
		public void a() {
			CallBacker callBacker = new CallBacker();
			callBacker.b(new CallBackUnit() {
				@Override
				public void callbackFunc() {
					System.out.println("end back!!!");
				}
			});
	}

当然，Java8似乎也有了匿名函数等等一些函数式的特性，有了这些实现CallBack机制就更简单了。