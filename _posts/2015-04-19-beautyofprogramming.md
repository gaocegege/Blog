---
layout: post
title: "编程之美2015资格赛"
description: 编程之美
headline:
modified: 2015-04-19
category: algorithm
tags: [algorithm]
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

做了[Hihocoder](http://hihocoder.com/hiho)上的两个问题，都是只用了最朴素的做法，估计大数据是过不去的。

# 问题二-回文字符序列

## 问题描述

给定字符串，求它的回文子序列个数。回文子序列反转字符顺序后仍然与原序列相同。例如字符串aba中，回文子序列为"a", "a", "aa", "b", "aba"，共5个。内容相同位置不同的子序列算不同的子序列。

### 输入

第一行一个整数T，表示数据组数。之后是T组数据，每组数据为一行字符串。

### 输出

对于每组数据输出一行，格式为"Case #X: Y"，X代表数据编号（从1开始），Y为答案。答案对100007取模。

### 数据范围

1 ≤ T ≤ 30

### 小数据

字符串长度 ≤ 25

### 大数据

字符串长度 ≤ 1000

### 样例输入

<pre>
	5
	aba
	abcbaddabcba
	12111112351121
	ccccccc
	fdadfa
</pre>

### 样例输出

<pre>
	Case #1: 5
	Case #2: 277
	Case #3: 1333
	Case #4: 127
	Case #5: 17
</pre>

## 想法

我的想法就是动态规划，状态有两个，是表示以i和j开头和结尾的子序列比以i + 1和j - 1 开头的子序列多几个可能，感觉设计的不太好，因为时间复杂度是O(n^4)级别的似乎。但是想不到比较好的做法了，就直接上了。之前也没参加过竞赛，不知道满不满足内存和时间的要求，目测多半是不太满足的。

这样做的话状态转移是：如果i == j，那么就是1；如果s[i] == s[j]，那么count[i][j] = [i + 1, j - 1]中所有回文子序列的和 + 1。理解起来还是比较直观的，就是如果i和j处的字符相等，那么增加的回文子序列就是[i + 1, j - 1]中所有的回文子序列再在左右分别加一个s[i]和s[j]，另外还多一个1就是s[i]s[j]，所以就是这样的方程。

但是这样其实时间复杂度很差劲，因为计算[i + 1, j - 1]中所有回文子序列的和需要两重循环来计算。比较差劲。

跑完小数据，时间是1ms，内存是4MB。

## 代码

	#include <iostream>
	#include <string>
	#include <vector>

	using namespace std;

	int binary(int a)
	{
		if (a > 0)
			return 1;
		else return 0;
	}

	int getCount(const vector<vector<int> > &dpCount, int a, int b, int sz)
	{
		int count = 0;
		for (int i = a; i < sz; ++i)
		{
			for (int j = i; j <= b; ++j)
			{
				count += dpCount[i][j];
			}
		}
		return count % 100007;
	}

	int dp(const string &s)
	{
		int sz = s.size();
		vector<vector<int> > dpCount(sz, vector<int>(sz, 0));
		for (int i = 0; i < sz; i++)
		{
			dpCount[i][i] = 1;
		}

		for(int i = 1; i < sz; i++)
		{
			int tmp = 0;
			for(int j = 0; j + i < sz; j++)
			{
				if(s[j] == s[j + i])
				{
					dpCount[j][j + i] = (getCount(dpCount, j + 1, j + i - 1, sz) + 1) % 100007;
				}
			}
		}

		return getCount(dpCount, 0, sz - 1, sz);
	}

	int main(int argc, char const *argv[])
	{
		int n;
		cin >> n;
		for (int i = 1; i <= n; i++)
		{
			string s;
			cin >> s;
			cout << "Case #" << i << ": " << dp(s) << endl;
		}
		return 0;
	}

# 问题三-基站选址

## 问题描述

需要在一个N × M的网格中建立一个通讯基站，通讯基站仅必须建立在格点上。网格中有A个用户，每个用户的通讯代价是用户到基站欧几里得距离的平方。网格中还有B个通讯公司，维护基站的代价是基站到最近的一个通讯公司的路程（路程定义为曼哈顿距离）。在网格中建立基站的总代价是用户通讯代价的总和加上维护基站的代价，最小总代价。

### 输入

第一行为一个整数T，表示数据组数。每组数据第一行为四个整数：N, M, A, B。接下来的A+B行每行两个整数x, y，代表一个坐标，前A行表示各用户的坐标，后B行表示各通讯公司的坐标。

### 输出

对于每组数据输出一行"Case #X: Y"，X代表数据编号（从1开始），Y代表所求最小代价。

### 数据范围

1 ≤ T ≤ 20

1 ≤ x ≤ N

1 ≤ y ≤ M

1 ≤ B ≤ 100

### 小数据

1 ≤ N, M ≤ 100

1 ≤ A ≤ 100

### 大数据

1 ≤ N, M ≤ 107

1 ≤ A ≤ 1000

### 样例输入

<pre>
	2
	3 3 4 1
	1 2
	2 1
	2 3
	3 2
	2 2
	4 4 4 2
	1 2
	2 4
	3 1
	4 3
	1 4
	1 3
</pre>

### 样例输出

<pre>
	Case #1: 4
	Case #2: 13
</pre>

## 想法

这题完全没想到有什么算法，就直接暴力地循环来求解了，不出所料时间复杂度极其差劲，跑完小数据就72ms了，内存到了193MB，大数据是指定不能过了。时间复杂度似乎是O(max(a, b) * n * m)，空间复杂度是O(n * m)。

想法大概是这样的，因为维修费用是到最近的一个公司的，所以在知道了所有的公司后，可以计算出地图上每一个位置的维修费用。计算完这个以后，公司的数据就没有其他作用了，接下来再迭代计算所有的用户到地图上某位置的费用之和，这个和与之前的维修费用加起来就是总共的费用，在所有的节点中选择那个费用最低的就好了。

这道题目想了一段时间了，还是没有想出比较好的做法，求指导。

## 代码

	#include <iostream>
	#include <vector>
	#include <set>
	#include <map>
	#include <cmath>
	#include <limits>

	using namespace std;

	struct Point
	{
		int x;
		int y;
		Point(int x_, int y_) :x(x_), y(y_) {}
	};

	void updateFixCost(vector<vector<int> > &costMap, const vector<Point> &company, int n, int m, int b)
	{
		for (int i = 0; i < b; ++i)
		{
			for (int j = 0; j < n; ++j)
			{
				for (int k = 0; k < m; ++k)
				{
					int tmp = abs(j - company[i].x) + abs(k - company[i].y);
					if (tmp < costMap[j][k])
						costMap[j][k] = tmp;
				}
			}
		}
	}

	int getRes(vector<vector<int> > &costMap, const vector<Point> &user, int n, int m, int a)
	{
		int res = numeric_limits<int>::max();
		for (int j = 0; j < n; ++j)
		{
			for (int k = 0; k < m; ++k)
			{
				int tmp = costMap[j][k];
				for (int i = 0; i < a; ++i)
				{
					tmp += (j - user[i].x) * (j - user[i].x) + (k - user[i].y) * (k - user[i].y);
				}
				if (tmp < res)
					res = tmp;
			}
		}
		return res;
	}

	int main(int argc, char const *argv[])
	{
		int sz;
		cin >> sz;
		for (int bufsz = 1; bufsz <= sz; ++bufsz)
		{
			int n, m, a, b;
			cin >> n >> m >> a >> b;
			vector<vector<int> > costMap(n, vector<int>(m, numeric_limits<int>::max()));
			vector<Point> user(a, Point(0, 0));
			vector<Point> company(b, Point(0, 0));
			for (int i = 0; i < a; ++i)
			{
				int bufx, bufy;
				cin >> bufx >> bufy;
				user[i] = Point(bufx, bufy);
			}
			for (int i = 0; i < b; ++i)
			{
				int bufx, bufy;
				cin >> bufx >> bufy;
				company[i] = Point(bufx, bufy);
			}
			// get the cost of fix
			updateFixCost(costMap, company, n, m, b);
			cout << "Case #" << bufsz << ": " << getRes(costMap, user, n, m, a) << endl;

		}


		return 0;
	}