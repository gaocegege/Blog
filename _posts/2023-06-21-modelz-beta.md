---
layout: post
title: "Serverless 推理服务 ModelZ 进入 Beta 公测！"
description: 
headline:
modified: 2023-06-21
category: 
tags: []
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

我们很高兴地宣布 [ModelZ](https://modelz.ai) 进入 Beta 公测，[ModelZ](https://modelz.ai) 是一个无服务器的 GPU 推理平台。用户不需要关心底层的基础设施，就可以获得高性能且低成本的 GPU 推理服务。

## 特性

[ModelZ](https://modelz.ai) 是一个托管的服务，为用户提供了简单的 API 和易用的 UI 来部署他们的机器学习模型。由 [ModelZ](https://modelz.ai) 负责所有底层基础设施，包括服务器、存储和网络。用户可以专注于开发模型和将它们部署在平台上，而无需担心底层基础设施。

[ModelZ](https://modelz.ai) 提供以下功能：

- **无服务器**: 无服务器的架构使我们能够根据您的需求轻松地扩展或缩小规模，为您提供可靠和可扩展的解决方案，以在任何规模上部署和原型化机器学习应用程序。
- **降低成本**: 仅支付您消耗的资源，不收取任何闲置服务器或冷启动的额外费用。加入我们即可获得 30 分钟免费使用L4 GPU。连接支付方式并获得额外的 90 分钟免费使用。
- **OpenAI 兼容的 API**: 我们的平台支持 OpenAI 兼容的 API，这意味着您可以轻松地将新的开源 LLM 集成到现有应用程序中，只需几行代码即可完成。
- **支持 Gradio 与 Streamlit 等 demo 框架**: 我们提供一个强大的原型环境，支持 Gradio 和 Streamlit。通过我们与 HuggingFace Space 的集成，访问预训练模型和启动演示变得更加容易。这样，您可以快速测试和迭代您的模型，在开发过程中节省时间和精力。

# 快速入门

使用 [ModelZ](https://modelz.ai) 很容易上手，只需要三个步骤就可以体验到 [ModelZ](https://modelz.ai) 的功能：

- 在网站上[注册账户](https://cloud.modelz.ai/login)。
- 使用 [ModelZ](https://modelz.ai) 提供的模板创建模型服务。
- 发送请求，或访问用户界面（仅支持 Gradio 和 Streamlit）。

<figure>
	<img src="{{ site.url }}/images/modelz-beta/templates.png" height="400" width="800">
    <figcaption>Templates on ModelZ</figcaption>
</figure>

这是一个使用 Modelz Beta 平台和 bloomz 560M 模板创建推理部署的完整工作流程示例。创建模型服务后，可以在用户界面中获得详细信息：

<figure>
	<img src="{{ site.url }}/images/modelz-beta/detail.png" height="400" width="800">
    <figcaption>详细信息</figcaption>
</figure>

我们会在 UI 中显示日志、事件（例如部署的自动扩缩容事件），以及指标（例如总请求数、正在处理中的请求数等）。除此之外，您还可以获得模型的文档和使用指南。

<figure>
	<img src="{{ site.url }}/images/modelz-beta/guide.png" height="400" width="800">
    <figcaption>模型的文档和使用指南</figcaption>
</figure>

模板中的 Bloomz 560M 由 [modelz-llm](https://github.com/tensorchord/modelz-llm) 支持，为模型提供了 OpenAI 兼容的 API。因此，您可以使用 OpenAI Python package 或者 langchain 直接使用该模型。首先，您需要从仪表板中获取 endpoint 和 [API 密钥](https://cloud.modelz.ai/settings)。

```python
import openai
openai.api_base="https://bloomz-webhiq5i9dagphhu.modelz.io"
# Use your API Key in modelz.
openai.api_key="mzi-xxx"

# create a chat completion
chat_completion = openai.ChatCompletion.create(
  model="any", messages=[{"role": "user", "content": "Hello world"}])
```

## Serverless

模型服务将在闲置一段时间后（可以在创建页面中进行配置）缩减为 0。在 UI 中可以获得自动缩放的事件和指标：

<figure>
	<img src="{{ site.url }}/images/modelz-beta/serverless.png" height="400" width="800">
    <figcaption>缩放事件</figcaption>
</figure>

<figure>
	<img src="{{ site.url }}/images/modelz-beta/metrics.png" height="400" width="800">
    <figcaption>指标</figcaption>
</figure>

## 社区

[ModelZ](https://modelz.ai) 构建在 [`envd`](https://github.com/tensorchord/envd), [mosec](https://github.com/mosecorg/mosec), [modelz-llm](https://github.com/tensorchord/modelz-llm) 等许多开源项目之上。如果您有兴趣加入 Modelz 社区，可以通过这些方式参与！

- 加入 [Modelz discord community](https://discord.gg/KqswhpVgdU)：我们有一个 Discord 社区，您可以与其他开发人员联系，提问，分享您的知识和专业知识。
- 贡献开源项目：Modelz 是建立在 [`envd`](https://github.com/tensorchord/envd), [mosec](https://github.com/mosecorg/mosec), [modelz-llm](https://github.com/tensorchord/modelz-llm) 等许多开源项目之上的。如果您有兴趣为这些项目做出贡献，可以查看它们的 GitHub 存储库并开始贡献。
- 分享您的模型和项目：如果您使用 Modelz 构建了一个机器学习模型或项目，我们很乐意听到您的分享！您可以在我们的 Discord 社区或 Twitter 上使用 #ModelZ 标签分享您的项目，或提及 [@TensorChord](https://twitter.com/TensorChord)。

如果你对 ModelZ 有任何的疑问或需求，也可以通过邮件联系我们：[modelz@tensorchord.ai](mailto:modelz@tensorchord.ai)

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.
