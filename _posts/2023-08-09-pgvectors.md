---
layout: post
title: "20倍速度提升：Rust 实现的 Postgres 向量相似度插件"
description: 
headline:
modified: 2023-08-09
category: 
tags: []
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

我们开源了 [pgvecto.rs](https://github.com/tensorchord/pgvecto.rs)，这是一个使用 Rust 编写的 Postgres 向量相似性搜索插件。它的 HNSW 算法在 90% 的召回率下比 pgvector 快 20 倍。但速度只是开始 - pgvecto.rs 的扩展性架构设计，可以支持 DiskANN 等新的算法。也希望能够借助社区的力量，让 pgvecto.rs 成为 Postgres 向量相似性搜索的标准。

## 为什么选择 Rust

通常 Postgres 插件都会选择使用 C 语言来实现，而 pgvecto.rs 使用  Rust 而不是 C，这与许多现有的 Postgres 扩展不同。它是建立在 [pgrx](https://github.com/tcdi/pgrx) 框架之上，pgrx 使得用户可以用 Rust 编写 Postgres 插件。而 Rust 为 pgvecto.rs 这样的插件提供了许多优势。

首先，Rust 的严格编译时检查保证了内存安全，有助于避免 C 扩展中可能存在的内存安全和错误问题。同样重要的是，Rust 提供了**现代化的开发工具，具有出色的文档、包管理和易于理解的错误消息**。这使得相对于庞大的 C 代码库，开发人员更容易使用和贡献 pgvecto.rs。Rust 的安全性和易用性使其成为构建下一代基于 pgrx 的 Postgres 插件（如pgvecto.rs）的理想语言。

除此之外，Rust 的社区也比 C 语言要繁荣地多。一个繁荣的社区也意味着更多的开发者，更多的开发者意味着更多的潜在贡献者，能够与我们一起更好地维护和发展 pgvecto.rs。

## 可扩展的架构

Pgvecto.rs 具有可扩展的架构，使其能够轻松添加对新的索引类型的支持。核心是一组定义了向量索引所需行为的 traits，例如构建、保存、加载和查询。实现新的索引只需创建该索引类型的 struct，并实现所需的 traits 即可。Pgvecto.rs 目前提供了两种内置的索引类型 - HNSW 用于最大搜索速度，ivfflat 用于基于量化的近似搜索。但是，任何人都可以创建额外的索引，例如 RHNSW、NGT 或针对特定用例定制的自定义类型。可扩展的架构使得 pgvecto.rs 能够适应新的向量搜索算法，并让您根据数据和性能需求选择合适的索引。Pgvecto.rs 为使 Postgres 中的向量搜索算法提供了扩展性的框架。

## 速度和性能

[基准测试](https://github.com/usamoi/pgvecto.rs-bench) 显示，pgvecto.rs 在速度上比现有的 Postgres 扩展 pgvector 有巨大的提升。在测试中，它的 HNSW 索引相对于 pgvector 的 ivfflat 索引表现出高达 25 倍的搜索性能。灵活的架构还允许使用不同的索引算法，以优化最大吞吐量或精度。我们目前正在开发量化的 HNSW，敬请期待！

<figure>
	<img src="https://hackmd.io/_uploads/SyOOvsC5n.png" height="400" width="800">
    <figcaption>Benchmark</figcaption>
</figure>

## 持久化

以前的工作如 pg_embedding 等，在实现 HNSW 索引方面做得很好，但缺乏持久性和适当的 CRUD 操作支持。pgvecto.rs 同时也添加了这两个核心功能。pgvecto.rs 使用 WAL（预写式日志记录）正确持久化向量索引。pgvecto.rs 在后台自动处理索引的保存、加载、重建和更新。您将获得持久化的索引，无需外部管理，同时与当前的Postgres部署和工作流程完美融合。

## 快速开始

假设您使用以下SQL命令创建了一个表：

```sql
CREATE TABLE items (id bigserial PRIMARY KEY, emb vector(4));
```

这里的vector(4)表示向量数据类型，4代表向量的维数。您可以使用未指定维数的 vector，但请注意，如果没有指定维数，则无法在向量类型上创建索引。接下来可以往表中插入数据：

```sql
INSERT INTO items (emb)
VALUES ('[1.1, 2.2, 3.3, 4.4]');
```

要使用 squared Euclidean distance 在 `emb` 向量列上创建索引，可以使用以下命令：

```sql
CREATE INDEX ON items USING vectors (emb l2_ops)
WITH (options = $$
capacity = 2097152
size_ram = 4294967296
storage_vectors = "ram"
[algorithm.hnsw]
storage = "ram"
m = 32
ef = 256
$$);
```

如果您想检索离原点最近的前10个向量，可以使用以下SQL命令：

```sql
SELECT *, emb <-> '[0, 0, 0, 0]' AS score
FROM items
ORDER BY emb <-> '[0, 0, 0, 0]'
LIMIT 10;
```

## 结论

pgvecto.rs 在 Postgres 向量检索方面提出了新的解决方案。它在 Rust 中的实现和可扩展的架构相比现有的扩展具有重要的优势，如速度、安全性和灵活性。我们很高兴将 pgvecto.rs 作为一个开源项目发布，采用 Apache 2.0 许可证，并迫不及待地想看到社区在其基础上构建的成果。pgvecto.rs 有很大的发展空间，可以添加新的索引类型和算法，针对不同的数据分布和用例进行优化，并与现有的 Postgres 工作流程集成。

我们鼓励您在 GitHub 上尝试使用 [pgvecto.rs](https://github.com/tensorchord/pgvecto.rs)，在您的工作负载中进行基准测试，并贡献您自己的索引创新。我们共同努力，将 pgvecto.rs 打造成 Postgres 所见过的最好的向量搜索扩展！潜力巨大，我们才刚刚开始。请加入我们，共同将向量搜索能力带入 Postgres 生态系统的旅程。加入我们的 [Discord](https://discord.gg/KqswhpVgdU)，与开发人员和其他用户一起努力改进 pgvecto.rs！

## 关于我们

我们公司 TensorChord 的使命是简化将机器学习模型投入生产的过程。我们的团队拥有来自 AWS、Tiktok 以及开源项目 Kubeflow、DGL 等的经验，在 MLOps 工程方面拥有广泛的专业知识。因此，如果您有任何与将模型投入生产相关的问题，请随时通过加入 [Discord](https://discord.gg/KqswhpVgdU) 或发送电子邮件至 modelz-support@tensorchord.ai 与我们联系。我们很乐意利用我们在建立 MLOps 平台方面的背景，为模型开发到部署工作流程的任何部分提供指导。

我们的产品和开源项目包括：

- [ModelZ](https://modelz.ai/)：一个托管的无服务器GPU平台托管服务，用于在公有云上快速地部署您自己的模型，并对其进行监控。
- [OpenModelZ](https://github.com/tensorchord/openmodelz)：ModelZ 的开源版本，可在任何地方部署，包括您的 Home Lab，或个人 PC。
- [Mosec](https://github.com/mosecorg/mosec)：一个高性能的模型服务框架，提供动态批处理（Dynamic batching）和 CPU/GPU 流水线，充分利用计算资源。它是 NVIDIA Triton 的简单且更快速的替代方案。
- [envd](https://github.com/tensorchord/envd)：一个命令行工具，可帮助您创建基于容器的AI/ML环境，从开发到生产的全过程。您只需要了解Python即可使用此工具。
- [ModelZ-llm](https://github.com/tensorchord/modelz-llm)：兼容 OpenAI API 的 LLM（包括LLaMA、Vicuna、ChatGLM等）和 embedding 的 API 服务器。

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.
