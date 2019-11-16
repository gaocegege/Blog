---
layout: post
title: "复式记账的自动化探索实践"
description: 
headline:
modified: 2019-11-15
category: 随笔
tags: []
imagefeature:
mathjax: false
chart:
comments: true
featured: false
---

BYVoid 前辈曾在[文章中](https://www.byvoid.com/zhs/blog/beancount-bookkeeping-1) 介绍了复式记账的一系列知识，我也是在那时接触了这一方面的内容。在尝试了两个月的手动记账后，虽然确实体会到了复式记账带来的在财务能力上的清晰感，但也因为记账本身的过程过于无聊单调，所以后来就放弃了。

然而随着下半年各种消费浪潮的侵袭，发现不记账实在难以控制自己在消费上的大手大脚。于是开始把目光投向了自动化复式记账的领域。在我开始寻找这方面的轮子的时候，GitHub 上有一个实现地比较完善的工具：[atb](https://github.com/dilfish/atb)。这是一个支持把支付宝账单自动转换为 [beancount][] 的工具，别看它 star 不多，但功能还挺完善的。但是，在读了它的代码后，发现它存在一个巨大的问题。

那就是扩展性不是很好。作者本身的需求似乎就是针对支付宝的，所以如果要让它支持微信，或者银行账单等，实现起来改动非常大。对于这样一个小众领域，而且是低频使用的工具，如果要想在开源领域有所建树，一定要尽可能覆盖更多的场景，保持扩展性的架构。这一方面可供参考的佼佼者是 [RSSHub](https://github.com/DIYgod/RSSHub)，本身 RSS 已经是一个逐渐式微的信息聚合协议，但是 RSSHub 极高的扩展性，使得它实现了自己的愿景：万物皆可 RSS。

额，扯远了。因为实现的扩展性问题，我决定参考借鉴 atb 的实现，实现一个扩展性较好的，自动化复式记账的轮子。这就是 [double-entry-generator][] 的由来。目前，[double-entry-generator][] 支持把支付宝和微信两种格式的账单转换为 [beancount][]。

从使用的角度，使用者只需要下载好账单，并且配置好对应的转换规则，就可以利用命令行工具 [double-entry-generator] 进行转换了。这里用微信账单举个例子：

```
微信支付账单明细,,,,,,,,
微信昵称：[你就是 gaocegege 么],,,,,,,,
起始时间：[2019-08-01 00:00:00] 终止时间：[2019-09-30 23:59:59],,,,,,,,
导出类型：[全部],,,,,,,,
导出时间：[2019-10-09 16:05:22],,,,,,,,
,,,,,,,,
共43笔记录,,,,,,,,
收入：1笔 0.35元,,,,,,,,
支出：1笔 28.16元,,,,,,,,
中性交易：0笔 0.00元,,,,,,,,
注：,,,,,,,,
1. 充值/提现/理财通购买/零钱通存取/信用卡还款等交易，将计入中性交易,,,,,,,,
2. 本明细仅展示当前账单中的交易，不包括已删除的记录,,,,,,,,
3. 本明细仅供个人对账使用,,,,,,,,
,,,,,,,,
----------------------微信支付账单明细列表--------------------,,,,,,,,
交易时间,交易类型,交易对方,商品,收/支,金额(元),支付方式,当前状态,交易单号,商户单号,备注
2019-09-26 12:45:27,商户消费,特朗普过桥米线,"总共消费:28.16",支出,¥28.16,中国银行,支付成功,3985734	,129847129	,"/"
2019-09-24 10:10:11,微信红包,同性好友,"/",收入,¥0.35,/,已存入零钱,3985734	,129847129	,"/"
```

微信导出的账单如上所示。在这个例子中，一共有两个记录，一个是消费，一个是红包收入。针对这样的记录，用户需要提供一份配置：

```yaml
defaultMinusAccount: Liabilities:CreditCard:Test
defaultPlusAccount: Expenses:Test
defaultCurrency: CNY
title: 测试账单
wechat:
  rules:
    - peer: 米线
      method: 中国银行
      plusAccount: Expenses:Food
      minusAccount: Assets:BOC
    - type: 收入
      plusAccount: Assets:Wechat
      minusAccount: Income:Earnings
```

这份配置中，我们定义了很多规则。首先是收款方中带有“米线”的，同时付款方式为中国银行的记录。在生成时把匹配到的记录的支出账户指定为 Assets:BOC，而收入账户指定为 Expenses:Food。意为用 BOC 支付了一次食物消费。第二个规则也类似，它识别出所有类型为收入的记录，并且把他们的支出账户指定为 Income:Earnings，收入账户指定为 Assets:Wechat。所有收入类型的记录，都增加微信钱包的余额，同时减少 Income:Earnings。

除此之外，配置中还定义了默认的收入与支出账户。在这个例子中，默认的支出账户是 Liabilities:CreditCard:Test 而默认的收入账户是 Expenses:Test。

最后，运行命令 `double-entry-generator translate --config <config.yaml> <wechat.csv>`，一个 beancount 文件就会被生成：

```
option "title" "测试账单"
option "operating_currency" "CNY"

1970-01-01 open Assets:BOC
1970-01-01 open Expenses:Food
1970-01-01 open Income:Earnings
1970-01-01 open Assets:Wechat
1970-01-01 open Expenses:Test
1970-01-01 open Liabilities:CreditCard:Test

2019-09-26 * "特朗普过桥米线" "总共消费:28.16"
	Expenses:Food 28.16 CNY
	Assets:BOC -28.16 CNY

2019-09-24 * "同性好友" "/"
	Assets:Wechat 0.35 CNY
	Income:Earnings -0.35 CNY
```

最后可以利用 fava 等工具进行可视化。

[double-entry-generator][] 为了实现对多种账单格式和多种复式记账语言的支持，引入了一个中间表示（A.K.A IR）。说是 IR，但其实现在还是非常简陋和粗糙，不过作用还是非常明显的。来自多种不同提供方的账单，会先被转换为中间表示，再由不同的编译器后端将其编译（严格意义上来说，应该是解释）为不同的记账语言的具体实现（如 beancount 等）。

因此如果想扩展支持新的账单格式，如中国银行信用卡账单等，可以新增 provider（账单提供方的抽象）的实现，而不需要修改其他部分的逻辑。如果想扩展支持新的记账语言，可以新增 compiler 的实现，同样不需要修改其他逻辑。

所以，这次造轮子告诉我们，果然，计算机领域的任何问题，都可以通过新加一层抽象来解决（

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.

[double-entry-generator]: https://github.com/gaocegege/double-entry-generator
[beancount]: https://github.com/beancount/beancount
