---
layout: post
title: "小议 agent Harness 设计上的 tradeoff"
headline:
modified: 2026-02-17
category: genai
tags: [genai]
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

从 Coding 发展而来，Agent 一定会进入人类社会。Agent 的架构应该是什么样子的？分享一下最近的思考，想到哪里写到哪里，抛砖引玉。

Coding agent 面向的场景下，基本所有的任务都是需要跟 workspace 交互完成。编码，编译，调试，部署，离不开操作系统。所有 Coding agent 时代发展来的产品，最早都是 Agent in the sandbox 的设计。这里说的 sandbox 不是 [Claude Code 隔离 Bash 使用的 BubbleWrap 这样的技术](https://code.claude.com/docs/en/sandboxing)。是说 Agent 运行时的假设就是运行在一个独立的只服务单个用户的环境中。

claude code 在安装了 desktop app 后，只有单个用户会使用它，一个 claude code harness 进程只服务一个用户，使用用户本地的操作系统。当 coding agent 慢慢被泛化，用在工作等场景上时，实际上需求发生了变化。云电脑成了一个真实的需求。对用户来说，能够在 web 或者移动端使用 agent 完成工作，是一个很好的体验。并且绝大多数工作并不像是编码一样，跟本地环境密切相关。ToB 历史上有非常多的远程开发的产品，比如 gitpod，coder，但发展都不怎么好（但 agent 时代焕发了第二春）。coding 对于云电脑的需求实际上是薄弱的，很难解决环境的一致性问题。我在我的 PC 上做了非常多的配置，丝滑地 migrate 到一个 cloud based 环境上，并且保持双向同步，是困难且收益不大的。coding 更主要的需求是远程控制。

但工作不一样，这个场景下云电脑是非常好的体验，这也是 Manus 当初带给人震撼的很重要的一个设计。在这样的场景下，用户在 ios app 上使用 agent，实际上的执行和运行环境是云端的。很多产品比如 Manus，WorkBuddy，Trae Work，都是采取了从 coding 场景更容易迁移过来的设计和实现，就是 agent in the sandbox。用户请求会路由到一个运行在 linux sandbox 的 agent 进程上，agent 进程会在 sandbox 内部执行用户的请求。这个进程仍然只需要服务一个用户。

这样的设计一定会被淘汰的。Anthropic 在一篇介绍 managed agents 的[工程文章](https://www.anthropic.com/engineering/managed-agents)里写过这个设计的缺点：

> But by coupling everything into one container, we ran into an old infrastructure problem: we’d adopted a pet. In the pets-vs-cattle analogy, a pet is a named, hand-tended individual you can’t afford to lose, while cattle are interchangeable. In our case, the server became that pet; if a container failed, the session was lost. If a container was unresponsive, we had to nurse it back to health.
>
> 但是，当把所有东西都放在同一个容器中时，我们遇到了一个老掉牙的基础设施问题：我们“养了只宠物”。用“宠物与牲畜”的比喻来说，宠物是有名字的、需要精心照料的东西，失去它就意味着巨大的损失；而牲畜则可以互相替代。在我们的情况下，服务器就相当于那只“宠物”：如果某个容器出现故障，那么与之相关的会话就会丢失。如果某个容器无法正常响应，我们就必须设法让它恢复正常状态。
>
>Nursing containers meant debugging unresponsive stuck sessions. Our only window in was the WebSocket event stream, but that couldn’t tell us where failures arose, which meant that a bug in the harness, a packet drop in the event stream, or a container going offline all presented the same. To figure out what went wrong, an engineer had to open a shell inside the container, but because that container often also held user data, that approach essentially meant we lacked the ability to debug.
>
> 所谓“护理容器”，其实是为了解决那些无法正常响应的程序问题而设计的。我们唯一的排查手段就是通过 WebSocket 事件流来获取信息，但这种方式无法确定故障的具体位置。也就是说，无论是连接故障、数据包丢失，还是容器本身离线，这些情况在事件流中都表现为相同的现象。为了解决问题，工程师不得不在容器内部打开命令行界面进行调试。但由于容器中通常还包含用户数据，这种做法实际上使得调试变得十分困难。

Coding 场景这样的设计是相对合理的，因为 coding 场景几乎所有的操作都需要一个操作系统。但除了 coding 场景以外的其他场景，应该是 server side agent。Agent 进程不再是一个 sandbox，而是一个服务端的进程，服务端的 agent 进程可以同时服务多个用户。这里就提出了新的问题，如何处理多租户。

Anthropic 的设计是抽象出了四个概念，session，tools（包括 MCP），sandbox 和 orchestration，这个分类是合理的，首先看看 sandbox。sandbox 可以被当作是一个无状态的执行环境，所有的状态都是 session。如果一个用户的请求并没有使用 `bash` 或者 `python` 这样的工具，那么这个请求就不需要 sandbox。并且，这样的设计里可以更进一步。一个核心观察是，绝大多数对 sandbox 的调用，不必须是一个完整的 linux 系统才能够处理。比如文件操作，未必要提供一个兼容 posix 的文件系统。[cloudflare/computer](https://github.com/cloudflare/computer) 就是沿着这个路线的探索。基于这个核心观察，最自然的优化思路就是先在 sandbox 之上提供一个更轻量的 JS runtime，来处理绝大多数的请求。只有当请求必须使用到 linux 时，才 fallback 到一个完整的 microvm。

在跟 [Raft](https://raft.build/) 的 CTO 天翼交流时有讨论到一个更加激进的设计思路，可以直接去掉完整的操作系统 vm，只提供一个轻量的 runtime。这里基于的观察是大多数 bash 对操作系统的操作，js 都可以做到，甚至可能做的更好。Bash 本身不一定是一个设计良好的语言。虽然它被模型训练地特别充分，但是 js 同样也是一个被充分训练的语言。js 的生态也非常丰富，这是一个值得探索的方向。

接下来是 session，这个是做 server side agent 最复杂的部分。相当于是需要支持多租户的状态管理。这里虽然 anthropic 抽象出了这个概念，但是在它的 managed agents 里这个抽象还是会束手束脚。Context 工程是 agent 唯一重要的事情，这也意味着需要非常多的策略和实验。就拿 compaction 来说，[逆向 codex compaction](https://tonylee.im/en/blog/codex-compaction-encrypted-summary-session-handover/) 就会发现它是一个复杂的策略。并且最新的 codex 实验特性，通过 notes 和上下文历史来 delegate 给模型来管理上下文，首先注册了很多新的工具：

| 分类 | 工具 | 参数 | 功能 |
| --- | --- | --- | --- |
| History | `history.list_windows` | `limit`、`agent_name`、`recent_first` | 列出窗口 ID 与 item 数量，用于寻找过去的窗口。 |
| History | `history.list_items` | `limit`、`recent_first`、`tool_namespace`、`role`、`agent_name`、`tool_name`、`window_id`、`max_chars_per_item` | 按窗口、角色或工具过滤 item，可限制每条预览长度。 |
| History | `history.read_item` | **`window_id`**、**`item_id`**；可选 `agent_name`、`offset_chars`、`limit_chars` | 精确读取一项的字符片段。offset 从 0 起；ID 原样传回，不能自行猜测或缩写。 |
| History | `history.search_contents` | **`query`**；可选 `limit`、`recent_first`、`tool_namespace`、`role`、`agent_name`、`tool_name`、`window_id` | 区分大小写的字面子串搜索，不是 embedding 检索。query 标为加密参数。 |
| Notes | `notes.list_files_by_prefix` | `prefix`、`max_results`、`file_order_by`、`file_order` | 按前缀列文件；排序字段为 `name` / `created_at` / `updated_at`，方向为 `ascending` / `descending`。 |
| Notes | `notes.read_file` | **`path`**；可选 `start_line`、`stop_line` | 读取全部内容或指定行区间。行号从 1 起、两端包含；负数从末尾倒数。 |
| Notes | `notes.search_contents` | **`query`**；可选 `max_matches_per_file`、`recent_file_first`、`max_files`、`path_prefix` | 对笔记行进行区分大小写的字面子串搜索。query 标为加密参数。 |
| Notes | `notes.append_to_file` | **`path`**、**`text`** | 原样追加文本；text 标为加密参数。不支持并行调用。 |
| Notes | `notes.write_file` | **`path`**、**`text`** | 创建或完整替换文件；text 标为加密参数。不支持并行调用。 |

并且利用了很多 system reminder 的机制，来实现在运行时，不同的阈值下引导模型去做不同的策略选择。这些实现和之前的标准 compaction 就是完全不同的思路。干净地把 session 和其他模块解耦，在我看来是在 agent 本身工程架构还在快速变化的阶段做的过度设计。作为应用开发者，这里还有很多需要做的考量是 system reminder 机制在不同模型上也是不一样的，openai 的模型基本是靠 developer role 的 message 来做，anthropic 新的模型是通过 system middle message 来做，旧的模型是通过 `<system-reminder>` 来做。不同的模型在 system reminder 的处理上有差异，甚至同一个模型在不同的版本上也有差异。这些差异也会反映在 session 上。

臆想一个最简单的功能，切换模型。system reminder 机制需不需要切换？没有被训练过使用 notes 和 history 管理上下文的模型，要不要 fallback 到标准的 compaction？工程上还是很复杂。

还有最重要的一点。agent in the sandbox 的设计里，evaluation 是相对容易做的。agent 可以跑在一个独立的 sandbox 里，自然也可以相对容易地跑在本地。如果是 server side agent，本身带了多租户的设计，如何保证 evaluation 的对象，agent 的 harness 是跟线上一致的，如何做合理的抽象和设计来支持离线自动化的 evaluation，并且过程中的工具调用是在一个可复现的环境里，能够多次重复执行，也是一个考验设计的地方。

还有 tools，memory，skills 等等不同的方面，都跟 context 的管理和披露方式有关。以后再讨论。
