---
layout: post
title: "ChatGPT API（降价 90%）对 LLM 领域的影响"
description: 
headline:
modified: 2023-03-02
category: 
tags: []
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

最近人工智能领域一个礼拜一个大新闻，毫不夸张。今天 OpenAI 宣布上线 ChatGPT API，并且相比于 GPT3 davinci 要便宜 90%，跟 [curie](https://platform.openai.com/docs/models/curie) 价格相同。OpenAI 相当于在 Chat Model 这个领域推出了 ChatGPT 能力的模型，但是价格只有之前的 90%。

因为身处相关行业，所以对这次降价的动作很感兴趣。我想知道这次降价会对 LLM 领域有什么影响，以及对于其他的 AI 产品会有什么影响。以下纯属个人在得知新闻的三个小时内形成的观点，仅供参考。

在 Hacker News 上 [upvote 最高的评论](https://news.ycombinator.com/item?id=34986033)直指 OpenAI 在以倾销的方式推出 ChatGPT API，为了让潜在的竞争者有更高的进入门槛。

<figure>
	<img src="https://user-images.githubusercontent.com/5100735/222332989-2ddb4a4a-6aa9-4846-a2f3-fe817c0e175e.png" height="300" width="800">
    <figcaption>Hackernews</figcaption>
</figure>

这种观点在 Hacker News 上有非常多的支持者。这种观点成立的前提，是 OpenAI 在这次降价后没法保持盈利。但是我们认为这个观点是不成立的。ChatGPT 推出的时候，大家认为它的参数量在 175B 上下（原始新闻出处找不到了）。

<figure>
	<img src="https://user-images.githubusercontent.com/5100735/222334636-bcb38d00-15f5-40a4-ae30-80c4fc012177.png" height="300" width="800">
    <figcaption>成本计算</figcaption>
</figure>

基于此，有评论计算了 OpenAI 的成本。这里没有考虑到 175B 对显存的需求，单纯计算了算力成本。结果不是很准确，但是可以看出 OpenAI 在 GPU 上的硬件成本跟定价比并不高。

另外，ChatGPT 现在的推理速度明显比刚出的时候有明显的提高，很大程度上暗示了模型的参数规模可能有数量级的降低。目前的 ChatGPT 很有可能是在 10B 这个参数规模。这个规模首先不需要考虑过多显存的问题，其次算力成本也会大大降低。重新按照这个标准计算一下，可以发现 OpenAI 的单卡每小时理论营收在 `312000/10/2/1000 * 3600 * 0.002 = 112`，也就是百美元量级。50% 的利用率是一个很高的数字了，但是降低到 25% 也是可以接受的，也是几十美元级别。另外如果参数规模在 50B，那么单卡每小时理论营收也是十美元级别。

考虑到单卡 A100 每小时的成本在 1-3 美元之间，OpenAI 作为微软投资的公司，应该可以获得更低的折扣。所以应该是可以保持盈利的。基于这样的估算，我觉得 OpenAI 的降价并不是倾销的行为，更有可能是通过工程优化让 ChatGPT 的规模降低了，进而降低了成本。

## 对 LLM 领域的影响

未来太难预测了，一周一个大新闻，谁也说不准。OpenAI 的降价对于 LLM 领域的影响取决于非常多的因素。其中最大的几个是：

- OpenAI 的领先程度。OpenAI 声称[自己不会利用用户数据训练 ChatGPT](https://techcrunch.com/2023/03/01/addressing-criticism-openai-will-no-longer-use-customer-data-to-train-its-models-by-default/)。我个人觉得这相当于自缚双手。不知道 OpenAI 现在的领先会维持多久。如果 OpenAI 是苹果，那么对应的安卓什么时候才能出现？而 LLM API 的用户粘性也是一个很大的问题。如果用户不满意，很容易就会切换到其他的 API。可能涉及到很多的 prompt redesign，但是 API 层的适配是成本比较低的。尤其是配合未来的发展可能使得 prompt engineering 的重要程度变得更低，foundation model 之间的差异变得更小。
- 资本的投入。LLM 是一个非常需要 $$$ 的行业。如果未来 OpenAI 真的考虑掠夺式定价，那么 LLM 领域的竞争会变得非常激烈。这个时候，LLM 领域的资本投入会变得非常重要。如果资本投入不足，那么很可能会 OpenAI 一家独大，它会把所有的用户都吸引过来。

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.
