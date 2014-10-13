---
layout: post
title: "最大最小堆计算动态中位数"
description: 堆应用
headline: 
modified: 2014-08-30
category: Algorithm
tags: [algorithm, heap]
imagefeature: 
mathjax: 
chart: 
comments: true
featured: false
---

算法作业中的一道题目~

# 描述要求

Design a data type that supports insert in logarithmic time, find-the-median in constant time.

设计一种数据结构，让动态求解中位数的插入时间复杂度为`logN`，返回中位数为`O(1)`。

# 概念与做法

中位数，是数学中的一个很简单的概念。在一个排序后的，有N个元素的数组中。它的中位数为：

	若N为奇数，则选择第（N+1）/2个为中位数;
	若n为偶数，则中位数是（N/2以及N/2+1）的平均数;

## 简单排序实现

求中位数，最简单的方法是，先对数组进行排序，然后根据数组的size进行判断，然后找出相应的中位数，这样做的时间复杂度为排序的时间复杂度，即`O(NlogN)`。

如果现在情况改变，数组的数据可以动态添加，那么这种方法，需要在插入的时候使用插入排序的方式，于是它的时间复杂度为`O(N)`，返回中位数的时间复杂度为`O(1)`。但是这样不符合要求，所以要想别的方法。

比较容易想到的方法是，利用二分查找，在排序后的数组中以插入的方式进行插入，如果元素的组织形式为链表而非数组，那么插入是可以做到`O(logN)`的。

## 最大最小堆实现

但是因为最近刚刚学了堆，所以估计作业是想让我们用堆来实现，想了很久想到一种实现方式。

要用堆来实现动态求中位数，需要维护两个堆，一个最大堆，一个最小堆。最大堆用来存储比中位数小的所有元素，最小堆用来存储比中位数大的所有元素。同时要维护两个int变量medianLow与medianLarge。元素数量为奇数时，中位数存储在medianLow中，元素数量为偶数时，中位数为medianLow和medianLarge的平均值。

插入的时候，如果插入之前有奇数个元素，那么分情况讨论：

	如果插入的元素大于插入前的中位数，即meidanLow，就将元素插入至最小堆，然后在最小堆中取出堆顶元素，存入medianLarge。
	如果插入的元素小于插入前的中位数，即meidanLow，就将元素插入至最大堆，然后在最大堆中取出堆顶元素，将medianLow存入medianLarge，然后将取出的堆顶元素存入medianLow。

而如果插入之前有偶数个元素，那么同样分情况讨论：

	如果插入的元素大于medianLarge，就将元素插入至最小堆，然后把medianLow插入至最大堆，此时medianLarge就是插入后数组的中位数。
	如果插入的元素小于medianLow，就将元素插入至最大堆，然后把medianLarge插入至最小堆，此时meidanLaw就是插入后数组的中位数。
	如果插入的元素大小在medianLow与medianLarge之间，就把medianLow与medianLarge分别插入最大堆与最小堆，此时原本需插入的元素为中位数。

而且显而易见，插入的时间复杂度是`O(logN)`的。

# CPP实现

实现此想法，需要先实现最大堆与最小堆，然后利用两个堆对数据进行操作。

	#include <iostream>

	using namespace std;

	/*Heap, max or min is optional by a string "max" or "min"*/
	template <class T>
	class Heap
	{
	public:
		Heap(T* data, int size, int maxSize, string str);
		~Heap();
		void insert(T value);
		T remove();
		void printHeap();
		int getSize();

		/*test func*/
		// void test();
		
	private:
		string attr;
		T* data;
		int size;
		int maxSize;

		/*assistant func*/
		int parent(int i);
		int leftChild(int i);
		int rightChild(int i);

		void swap(int i, int j);

		/*main func*/
		void heapKeep(int i);
		void buildHeap();
	};

	/*median Heaps. it has two heaps, 
	 *one is min heap which stores the node whose value is larger than median
	 *and other one is max heap which stores the node whose value is lower than median
	 */
	class MedianHeap
	{
	public:
		MedianHeap(int size);
		void insert(int number);
		int returnMedian();
	private:
		Heap<int> maxHeap;
		Heap<int> minHeap;
		/*when size is odd, median stores in medianLow
		 *when size is even, median stores in medianLow(low number) and medianLarge(large number)
		*/
		int medianLow, medianLarge;
		int size;
	};

	template<class T>
	Heap<T>::Heap(T* data, int size, int maxSize, string str)
		:data(data), size(size), maxSize(maxSize), attr(str)
	{
		buildHeap();
	}

	template<class T>
	Heap<T>::~Heap()
	{
		delete[] data;
	}

	template<class T>
	int Heap<T>::parent(int i)
	{
		return i / 2;
	}

	template<class T>
	int Heap<T>::leftChild(int i)
	{
		if (i * 2 <= size)
			return i * 2;
		else
			return NULL;
	}

	template<class T>
	int Heap<T>::rightChild(int i)
	{
		if (i * 2 + 1 <= size)
			return i * 2 + 1;
		else
			return NULL;
	}

	template<class T>
	void Heap<T>::swap(int i, int j)
	{
		T buf = data[i];
		data[i] = data[j];
		data[j] = buf;
	}

	/*time complexity: log(n)*/
	template<class T>
	void Heap<T>::heapKeep(int i)
	{
		if (i >= size)
			return;
		int index = i;
		T selected = data[i];

		/*choose the min or max element in the item and its childs*/
		if (leftChild(i) != NULL)
		{
			T lc = data[leftChild(i)];
			/*max heap*/
			if (attr == "max" && selected < lc)
			{
				index = leftChild(i);
				selected = lc;
			}
			/*min heap*/
			else if (attr == "min" && selected > lc)
			{
				index = leftChild(i);
				selected = lc;
			}
		}
		if (rightChild(i) != NULL)
		{
			T rc = data[rightChild(i)];
			/*max heap*/
			if (attr == "max" && selected < rc)
			{
				index = rightChild(i);
				selected = rc;
			}
			/*min heap*/
			else if (attr == "min" && selected > rc)
			{
				index = rightChild(i);
				selected = rc;
			}
		}

		/*swap and recursive*/
		if (index != i)
		{
			swap(i, index);
			heapKeep(index);
		}
	}

	/*time complexity:n * log(n)*/
	template<class T>
	void Heap<T>::buildHeap()
	{
		/*keep the max when the node has a child or has two children*/
		for (int i = (size / 2); i >= 1; i--)
		{
			heapKeep(i);
		}
	}

	template<class T>
	void Heap<T>::printHeap()
	{
		for (int i = 1; i <= size; i++)
			cout << data[i] << " ";
		cout << endl;
	}

	/*time complexity: log(n)*/
	template<class T>
	void Heap<T>::insert(T value)
	{
		/*whether the node can be added*/
		if (size + 1 > maxSize)
		{
			cout << "Heap::increaseNode err, size fault\n";
		}

		size += 1;
		int i = size;
		data[i] = value;
		while(i > 1) 
		{
		    if (attr == "max" && data[parent(i)] < data[i])
		    {
		    	swap(parent(i), i);
		    	i = parent(i);
		    }
		    else if (attr == "min" && data[parent(i)] > data[i])
		    {
		    	swap(parent(i), i);
		    	i = parent(i);
		    }
		    else
		    	break;
		    // cout << "Debug info -> " << i << endl;
		}
	}

	/*time complexity: log(n)*/
	template<class T>
	T Heap<T>::remove()
	{
		/*move the last leaf node to the root node, and keep it in maxHeap order*/
		T result = data[1];
		data[1] = data[size];
		size -= 1;
		heapKeep(1);
		return result;
	}

	template<class T>
	int Heap<T>::getSize()
	{
		return size;
	}

	// template<class T>
	// void Heap<T>::test()
	// {
		// int size = 0;
		// int maxSize = 0;
		// cin >> size >> maxSize;
		// cout << "Yeah~Choose maxHeap or minHeap~\n";
		// int buf = 0;
		// cout << "cin " << size << " numbers\n";
		// int* data = new int[maxSize];
		// for (int i = 1; i <= size; i++)
		// {
		// 	cin >> data[i];
		// }
		// cout << "cin end\n";
		// Heap<int> heap(data, size, maxSize, "max");
		// cout << "build end\n";
		// heap.printHeap();
		// heap.insert(10);
		// cout << "insert end\n";
		// heap.printHeap();
	// }

	MedianHeap::MedianHeap(int size)
		:medianLow(0), medianLarge(0), size(0), 
		maxHeap(Heap<int>(new int[size], 0, size, "max")), 
		minHeap(Heap<int>(new int[size], 0, size, "min"))
	{
		// int* data1 = new int[size];
		// int* data2 = new int[size];

		// maxHeap = Heap<int>(data1, 0, size, "max");
		// minHeap = Heap<int>(data2, 0, size, "min");
	}

	void MedianHeap::insert(int number)
	{
		if (size == 0)
		{
			medianLow = number;
			size++;
			return;
		}

		/*former median is one number*/
		if (size % 2 == 1)
		{
			/*the number need to inserted is larger than the median now*/
			if (number > returnMedian())
			{
				minHeap.insert(number);
				/*get the second median number 
				 *which is the lowest one in which is larger than the median now*/
				medianLarge = minHeap.remove();
			}
			else if (number <= returnMedian())
			{
				maxHeap.insert(number);
				medianLarge = medianLow;
				medianLow = maxHeap.remove();
			}
		}
		else if (size % 2 == 0)
		{
			if (number >= medianLarge)
			{
				minHeap.insert(number);
				maxHeap.insert(medianLow);
				medianLow = medianLarge;
			}
			else if (number <= medianLow)
			{
				maxHeap.insert(number);
				minHeap.insert(medianLarge);
			}
			else if (number > medianLow && number < medianLarge)
			{
				maxHeap.insert(medianLow);
				minHeap.insert(medianLarge);
				medianLow = number;
			}
		}
		// /*should insert into minheap*/
		// if (number > median)
		// {
		// 	if (minHeap.getSize() + 1 - maxHeap.getSize() >= 2)
		// 	{
		// 		minHeap.insert(number);
		// 		maxHeap.insert(median);
		// 		median = minHeap.remove();
		// 	}
		// 	else
		// 	{
		// 		minHeap.insert(number);
		// 	}
		// }
		// /*should insert into maxheap*/
		// else
		// {
		// 	if (maxHeap.getSize() + 1 - minHeap.getSize() >= 2)
		// 	{
		// 		maxHeap.insert(number);
		// 		minHeap.insert(median);
		// 		median = maxHeap.remove();
		// 	}
		// 	else
		// 	{
		// 		maxHeap.insert(number);
		// 	}
		// }
		size++;
	}

	int MedianHeap::returnMedian()
	{
		if (size % 2 == 1)
			return medianLow;
		else
			return ( medianLarge + medianLow ) / 2;
	}

	int main()
	{
		int number = 0;
		int size = 0;
		cout << "input the size of heap\n";
		cin >> size;
		MedianHeap medianHeap(size);
		while(cin >> number) {
		    medianHeap.insert(number);
		    cout << "The median is " << medianHeap.returnMedian() << endl;
		}
	}

