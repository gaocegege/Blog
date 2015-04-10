---
layout: post
title: "Builder模式"
description: 设计模式学习
headline:
modified: 2015-04-11
category: design pattern
tags: [design pattern, constructor pattern]
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

只是初学，有问题可以讨论~

## Builder模式

假设现在我们需要构造一个对象，这个对象有好多的成员变量。就比如说是这个对象是用来保存产品的营养参考信息，需要保存产品的含糖量，脂肪含量，等等。那在这么多的成员变量里，有些成员变量是必须被初始化的，有些成员变量是不一定需要给定的。比如说产品的食用剂量是需要给定的，其他所有的数据都是可以不给定的。那这个时候，如果用构造函数应该如何去做呢，应该申明一个构造函数，它有一个必须的参数，其他还有很多个可选参数。

这样使用构造函数会有一些不方便，因为在Java里面，函数参数只允许按位传递，不支持按名称传递，所谓按名称传递，就是说比如函数声明为`def fun(arg1, arg2, arg3)`，在Python等支持按名称传递的语言里就可以这样写：`fun(1, arg2=2, arg3=3)`。可以根据函数定义时候的参数的名字来绑定传入的参数。所以在构造上面提到的这种需要参数比较多，而且存在必选可可选参数之分的情况的时候，构造函数是比较难以Hold住这样的情况的。

而Builder模式可以解决这样的问题。

	// Builder Pattern
	public class NutritionFacts {
		private final int servingSize;
		private final int servings;
		private final int calories;
		private final int fat;
		private final int sodium;
		private final int carbohydrate;
		public static class Builder {
			// Required parameters
			private final int servingSize;
			private final int servings;
			// Optional parameters - initialized to default values
			private int calories = 0;
			private int fat = 0;
			private int carbohydrate = 0;
			private int sodium = 0;
			public Builder(int servingSize, int servings) {
				this.servingSize = servingSize;
				this.servings = servings;
			}
			public Builder calories(int val)
				{ calories = val; return this; }
			public Builder fat(int val)
				{ fat = val; return this; }
			public Builder carbohydrate(int val)
				{ carbohydrate = val; return this; }
			public Builder sodium(int val)
				{ sodium = val; return this; }
			public NutritionFacts build() {
				return new NutritionFacts(this);
			}
		}
		private NutritionFacts(Builder builder) {
			servingSize = builder.servingSize;
			servings = builder.servings;
			calories = builder.calories;
			fat = builder.fat;
			sodium = builder.sodium;
			carbohydrate = builder.carbohydrate;
		}
	}

在构造的时候可以这样来做：

	NutritionFactscocaCola = new NutritionFacts.Builder(240, 8).
    	calories(100).sodium(35).carbohydrate(27).build();

这样可以比较近似地实现Python等语言中支持的按照名字来传递参数，形式上也比较类似。这样做比起用构造函数，肯定是要方便很多。但是也会有不少人很直观地想到，这跟JavaBean的Setter有什么区别，Setter也是一个参数一个参数地来初始化的嘛。其实**最大的区别在于真正构造对象的时间点上。**其实Builder并没有提前把对象构造出来然后再一个个地对参数进行设置，而是先设定值，再在最后的build()方法中构建出对象。这样在一些参数存在依赖关系的时候，可以很好地解决依赖的问题。当然，对于参数的传递也不一定要按照上面写的方式，Setter其实也是可以的，其思想不在于模拟按名字传递参数，在于后面的build()。

从上面的例子中可以看出，Builder模式多数是用于对象比较复杂，可以逐步去构建的时候，其核心在于**将类的构建逻辑转移到类的实例化外部。**其经典应用是从一段文本中构建对象，因为文本的读入是以流的形式，那么一开始的时候可能没有办法创建完整的目标对象，这时候可以使用构建者模式来进行构建。