---
layout: post
title: "一维Closest Pair Problem"
description: Closest Pair Problem
headline: 
modified: 2014-10-15
category: Algorithm
tags: [algorithm, cpp]
imagefeature: 
mathjax: 
chart: 
comments: true
featured: true
---

算法PPT中提到的一个问题~

# 描述

The closest pair of points problem or closest pair problem is a problem of computational geometry: given n points, find a pair of points with the smallest distance between them.

指定N个点，计算N个点之间的最小距离。一维情况下只有x坐标。

# 想法

最简单的方法是两重循环，时间复杂度为`O(n^2)`，而采取了Divide and conquer的方法后，其递归式为T(n) = 2T(n / 2) + O(n)，时间复杂度可以由主定理计算出，为`O(nlogn)`。`/*总感觉不太科学啊*/`

大致思想就是，将点分为两组，分别计算左边与右边组的最短距离，而所有点的最短距离要么是右边的最短距离，要么是左边的最短距离，要么是右边的最左点与左边的最右点的距离。

而左边组与右边组的最短距离可以递归求解，右边的最左点与左边的最右点的距离是combine的过程，时间复杂度为`O(n)`，体现在对最左点和最右点的寻找上。

在实现时对以上的想法做了改动，先对数据进行了排序，这样combine的操作时间复杂度为`O(1)`，但是总的时间复杂度还是`O(nlogn)`，因为排序。

# CPP实现

	#include <iostream>
	#include <algorithm>
	#include <cmath>

	#define VERYHIGH 1000000

	using namespace std;

	/*Point*/
	struct Point
	{
		int x;
	};

	class ClosestPairSolver
	{
	public:
		ClosestPairSolver(struct Point* points, int size);
		~ClosestPairSolver();
		void printResult();
		
	private:
		/*assitant func*/
		void sortByX();
		static int cmpByX(const void *a, const void *b);
		double dis(int i, int j);
		double recursiveSolve(int low, int high, int &leftPoint, int &rightPoint);

		int size;
		struct Point* pointsByX;
		int minDistence;
		int left;
		int right;
	};

	ClosestPairSolver::ClosestPairSolver(struct Point* points, int size)
		:pointsByX(points), size(size), minDistence(VERYHIGH), left(0), right(0) 
	{
		sortByX();
		/*slove the problem*/
		minDistence = recursiveSolve(0, size - 1, left, right);
	}

	ClosestPairSolver::~ClosestPairSolver()
	{
		delete[] pointsByX;
	}

	/*compare func used in qsort*/
	int ClosestPairSolver::cmpByX(const void *a, const void *b)
	{
		struct Point* pa = (struct Point*) a;
		struct Point* pb = (struct Point*) b;

		if (pa->x > pb->x)
			return 1;
		else
			return -1;
	}

	/*sort by x order*/
	void ClosestPairSolver::sortByX()
	{
		qsort(pointsByX, size, sizeof(struct Point), cmpByX);
	}

	/*clacute the distence between point[i] and point[j]*/
	double ClosestPairSolver::dis(int i, int j)
	{
		return abs((double) pointsByX[i].x - (double) pointsByX[j].x);
	}

	double ClosestPairSolver::recursiveSolve(int low, int high, int &leftPoint, int &rightPoint)
	{
		int minDis = 0;
		int leftlow, lefthigh, rightlow, righthigh;
		int median = (low + high) / 2;

		/*there only have two points*/
		if (high - low == 1)
		{
			leftPoint = low;
			rightPoint = high;
			return dis(high, low);
		}
		/*three points*/
		else if (high - low == 2)
		{
			int disBetweenLowAndMedian = dis(median, low);
			int disBetweenMedianAndHigh = dis(median, high);
			if (disBetweenMedianAndHigh < disBetweenLowAndMedian)
			{
				leftPoint = median;
				rightPoint = high;
				minDis = disBetweenMedianAndHigh;
			}
			else
			{
				leftPoint = low;
				rightPoint = median;
				minDis = disBetweenLowAndMedian;
			}
			return minDis;
		}

		/*divide and conquer: devide and conquer*/
		double minDisInLeft = recursiveSolve(low, median, leftlow, rightlow);
		double minDisInRight = recursiveSolve(median + 1, high, lefthigh, righthigh);

		if (minDisInLeft < minDisInRight)
		{
			leftPoint = leftlow;
			rightPoint = rightlow;
			minDis = minDisInLeft;
		}
		else
		{
			leftPoint = lefthigh;
			rightPoint = righthigh;
			minDis = minDisInRight;
		}

		/*divide and conquer: combine*/
		int disTwo = dis(median, median + 1);
		if (minDis > disTwo)
		{
			leftPoint = median;
			rightPoint = median + 1;
			minDis = disTwo;
		}

		return minDis;
	}

	void ClosestPairSolver::printResult()
	{
		cout << "The minDistence is " << minDistence << endl;
		cout << "And the points's x are " << pointsByX[left].x << " and " << pointsByX[right].x << endl;
	}

	int main()
	{
		int size = 0;
		cout << "Please input the size\n";
		cin >> size;
		struct Point* points = new struct Point[size];
		for (int i = 0; i < size; i++)
		{
			int buf;
			cin >> buf;
			points[i].x = buf;
		}
		ClosestPairSolver solver(points, size);
		solver.printResult();
	}