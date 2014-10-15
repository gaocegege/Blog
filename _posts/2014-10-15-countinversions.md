---
layout: post
title: "Divide and conquer计算逆序数"
description: Devide and conquer
headline: 
modified: 2014-10-15
category: Algorithm
tags: [algorithm, Divide and conquer, cpp]
imagefeature: 
mathjax: 
chart: 
comments: true
featured: false
---

又是算法作业中的一个题目

# 描述

An inversion in an array `a[]` is a pair of entries `a[i]` and `a[j]` such that `i<j` but `a[i]>a[j]`. Given an array, design a linearithmic `(O(nlogn))` algorithm to count the number of inversions.

在一个排列中，如果一对数的前后位置与大小顺序相反，即前面的数大于后面的数，那么它们就称为一个逆序。题目要求一个可以计算出给定数组的逆序数个数的算法，时间复杂度为`(O(nlogn))`

# 想法

最简单的算法，时间复杂度为`O(n^2)`，就是两重循环判断是否存在逆序数，存在就计数器加一，实现起来很简单。而要求为`O(nlogn)`，因此要另寻他法。

因为最近讲了Devide and conquer的思想，因此肯定是要用这个来解决问题。类比归并排序，发现在归并的过程中可以统计逆序数的个数。在归并的过程中，有两个有序的数组，而且两个数组是有界的，右边的数组也是在原数组的右边，左边的亦然。在每次归并排序时，当左边数组里的某个元素a大于右边某个元素b时，这时候就是发现逆序数的时候。左边数组里a后面的所有元素都会比b大，这就是归并排序解决逆序数问题的关键。

这样做有一个问题就是，等找到逆序数的个数的时候，数组的次序已经被破坏了，已经是排好序的数组了。不过问题不大，可以在开始的时候保存一个副本，然后找完逆序数再复原数据。

# CPP实现
	#include <iostream>

	using namespace std;

	class InversionCounter
	{
	public:
		InversionCounter(int* data, int size);
		~InversionCounter();
		int countInversions(int low, int high);
		void printResult();
	private:
		int mergeAndCount(int low, int high);
		int* data;
		int size;
		int num;
	};

	InversionCounter::InversionCounter(int* data, int size)
		:data(data), size(size), num(0)
	{

	}

	InversionCounter::~InversionCounter()
	{
		delete[] data;
	}

	int InversionCounter::countInversions(int low, int high)
	{
		if (low == high)
			return 0;

		int median = (low + high) / 2;
		/*devide into two parts*/
		int leftNum = countInversions(low, median);
		int rightNum = countInversions(median + 1, high);
		/*conquer and combine*/
		int nums = mergeAndCount(low, high);
		num = nums + leftNum + rightNum;
		return num;
	}

	int InversionCounter::mergeAndCount(int low, int high)
	{

		int median = (low + high) / 2;
		int* bufArray = new int[high - low + 1];
		int ptr = 0;
		int count = 0;

		int i = low, j = median + 1;
		while(i <= median && j <= high) 
		{
		    if (data[i] < data[j])
		    {
		    	bufArray[ptr] = data[i];
		    	ptr++;
		    	i++;
		    }
		    else
		    {
		    	bufArray[ptr] = data[j];
		    	ptr++;
		    	j++;
		    	/*critic code: add the count of the inversions-----------*/
		    	count += median - i + 1;
		    }
		}

		while(i<=median) {
		    bufArray[ptr] = data[i];
		    ptr++;
		    i++;
		}

		while(j <= high) {
		    bufArray[ptr] = data[j];
		    ptr++;
		    j++;
		}

		for (int i = low; i <= high; i++)
		{
			data[i] = bufArray[i - low];
		}

		delete[] bufArray;
		return count;
	}

	void InversionCounter::printResult()
	{
		cout << num << endl;
	}

	int main(int argc, char const *argv[])
	{
		int size;
		cout << "Please input the size of array\n";
		cin >> size;
		int* data = new int[size];
		cout << "Please input the data\n";
		for (int i = 0; i < size; i++)
		{
			cin >> data[i];
		}

		InversionCounter counter(data, size);
		counter.countInversions(0, size - 1);
		counter.printResult();
		return 0;
	}