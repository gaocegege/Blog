---
layout: post
title: "golang中的array与slice"
description: 
headline:
modified: 2016-04-28
category: golang
tags: [golang]
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

最开始使用golang是在进了实验室后，因为要做docker方面的事情，就先学习了下写docker的语言。后来的毕设，和在做的MIT 6.824的Lab都有在用golang来写。一开始觉得这门语言好丑，用着用着就发现其实还是很不错的一门语言，要是感觉没错的话应该是一门强类型的静态语言。语言的表达能力也蛮强的，不像Java那样非常容易产生代码的膨胀。在我自己看来，golang是一门跟C++比较接近的语言，因为都有指针的概念Orz。从大二以来，就没写过这么方便的语言了hhhh

在使用golang的过程中，有一个肯定要接触的概念，那就是Array和Slice。这两者都是为了描述数组而存在的，但其内在的含义有一些不同。下面先谈谈Array，然后再讲讲Slice相比于Array的不同。

## Array

Array是一个非常经典的概念了，就是在内存里一块连续的空间，用以存储相同类型的变量。在golang中，声明Array的方式也非常简单：

	var buffer [256]byte

声明Array时，Array的类型包括它的Element的类型，以及Size。正是因为需要指定Size，所以使得很多时候在golang中很少使用它，这个之后再说。Array的概念跟在C++，Java这些语言中没有什么不同，那下面就来看看golang中比较独特的概念，Slice。

## Slice

上面提到Array是一个在内存中连续的空间，而声明的变量就指代这个空间。而Slice并不是这样的，**Slice并不是Array，而是描述Array的一部分的数据结构(A slice is not an array. A slice describes a piece of an array.)**其声明跟Array有一点点不同：

	var slice []byte

在声明一个Array的时候，programmer需要指定这个Array的Size，这样才会使得golang知道要向内存申请多大的空间。而在声明一个Slice的时候，只需要包括其Element的类型即可。那到底Slice是怎么实现的呢？作为一个一般的programmer，只需要知道它是这样的一个结构就好了：

	type sliceHeader struct {
	    Length        int
	    ZerothElement *byte
	}

	slice := buffer[100:150]

	slice := sliceHeader{
	    Length:        50,
	    ZerothElement: &buffer[100],
	}

Slice是由Length和指向第一个Element的指针构成，因此相比于Array而言，有着更大的表现力。下面针对Slice的一些特性写了一些Test代码：

### Length & Capacity

	var buffer [256]byte

	func main() {
	    slice := buffer[10:20]
	    fmt.Printf("The capacity of the slice is %d, and the length of the slice is %d\n", cap(slice), len(slice))
	    slice = buffer[100:200]
	    fmt.Printf("The capacity of the new slice is %d, and the length of the new slice is %d\n", cap(slice), len(slice))
	}

Output是这样的：

	The capacity of the slice is 246, and the length of the slice is 10
	The capacity of the new slice is 156, and the length of the new slice is 100

这里需要介绍两个函数，一个是len，一个是cap，分别是计算一个容器的现在的长度，以及最大的容量。我们可以看到，Slice的length，就是被赋值的那段Array的长度，而它的capacity是从被赋值的第一个元素开始，到原Array中最后一个元素的长度。这样的定义非常的自然，但是如果不知道Slice的实现的话就会有些wired。

### 越界

	/* out of bounds for array. */
	var buffer [256]byte
	
	func main() {
	    fmt.Println(buffer[256])
	}

	/* out of bounds for slice. */
	var buffer [256]byte
	
	func main() {
	    slice := buffer[0:10]
	    fmt.Println(slice[10])
	}

他们的输出分别是：

	/* out of bounds for array. */
	# command-line-arguments
	./main.go:<Line of the code>: invalid array index 256 (out of bounds for 256-element array)

	/* out of bounds for slice. */
	panic: runtime error: index out of range

	goroutine 1 [running]:
	main.main()
	    /Users/gaoce/Github/labenv/golang/main.go:11 +0x111
	exit status 2

这是两者比较不同的地方，对于Array的越界访问，golang会在编译时报错，而对于Slice的越界访问，则会在运行时报错。这算是一个Slice的可变性强带来的缺点吧。

### 函数传参

	var buffer [256]byte

	func AddOneToEachElement(slice []byte) {
	    for i := range slice {
	        slice[i]++
	    }
	}

	func main() {
	    slice := buffer[10:20]
	    // set slice to [0,1,2,3...]
	    for i := 0; i < len(slice); i++ {
	        slice[i] = byte(i)
	    }
	    fmt.Println("before", slice)
	    AddOneToEachElement(slice)
	    fmt.Println("after ", slice)
	}

输出为：

	before [0 1 2 3 4 5 6 7 8 9]
	after  [1 2 3 4 5 6 7 8 9 10]

这说明Slice传递给函数后，其指向的内存里的内容还是会被修改的，这是跟Slice的实现相关的，因为其维护的是第一个元素的指针，所以无论Slice本身是按值传递还是按引用传递，如果对Slice指向的内存的内容做了修改，都是会影响原本的Slice变量的。

	var buffer [256]byte

	func SubtractOneFromLength(slice []byte) []byte {
	    slice = slice[0 : len(slice)-1]
	    return slice
	}

	func main() {
	    slice := buffer[0:10]
	    fmt.Println("Before: len(slice) =", len(slice))
	    newSlice := SubtractOneFromLength(slice)
	    fmt.Println("After:  len(slice) =", len(slice))
	    fmt.Println("After:  len(newSlice) =", len(newSlice))
	}

输出为：

	Before: len(slice) = 10
	After:  len(slice) = 10
	After:  len(newSlice) = 9

这个就说明Slice是call by value的，嗯，就不解释了。