# Hugo 博客迁移说明

这是从 Jekyll 迁移到 Hugo 的博客项目。

## 迁移内容

- ✅ 171 篇博客文章
- ✅ 原始 CSS 样式（保持原样）
- ✅ JavaScript 功能
- ✅ 页面布局（首页、文章页、关于页等）
- ✅ 导航菜单
- ✅ 分页功能
- ✅ Giscus 评论系统
- ✅ Google Analytics

## 文件结构

```
hugo-blog/
├── hugo.toml           # Hugo 配置文件
├── content/            # 博客内容
│   ├── posts/          # 博客文章（171篇）
│   ├── about.md        # 关于页面
│   ├── opensource.md   # 开源项目页面
│   └── ...
├── layouts/            # HTML 模板
│   ├── index.html      # 首页模板
│   ├── _default/       # 默认模板
│   │   ├── baseof.html
│   │   ├── single.html # 文章详情页
│   │   └── page.html   # 静态页面
│   ├── partials/       # 可重用组件
│   │   ├── head.html
│   │   ├── footer.html
│   │   ├── menu.html
│   │   └── ...
│   ├── categories/     # 分类页面
│   └── tags/           # 标签页面
├── static/             # 静态资源
│   ├── css/            # 样式文件
│   ├── js/             # JavaScript
│   └── images/         # 图片
└── themes/             # 主题目录
    └── notepad-china/  # 自定义主题
```

## 构建命令

```bash
# 进入项目目录
cd hugo-blog

# 开发模式（带热重载）
hugo server -D

# 构建站点
hugo --gc

# 构建（包含草稿）
hugo --gc --buildDrafts
```

## 部署

构建完成后，所有生成的文件都在 `public/` 目录中。将此目录的内容部署到你的 Web 服务器即可。

对于 GitHub Pages:
```bash
# 构建
hugo --gc

# 将 public/ 目录的内容推送到 gh-pages 分支
cd public
git init
git add .
git commit -m "Deploy to GitHub Pages"
git push -f git@github.com:yourusername/yourrepo.git gh-pages
```

## 新增文章

```bash
# 创建新文章
hugo new content posts/YYYY-MM-DD-title.md

# 或者手动创建文件到 content/posts/ 目录
```

文章 front matter 格式：
```yaml
---
title: "文章标题"
description: "文章描述"
modified: 2024-01-01
categories:
  - 随笔
tags:
  - tag1
  - tag2
imagefeature: ""
mathjax: false
chart: false
comments: true
featured: false
---
```

## 配置

主要配置在 `hugo.toml` 文件中，包括：

- 站点信息（标题、描述、logo）
- 作者信息
- 导航菜单
- 评论系统（Giscus）
- 分析工具（Google Analytics）

## 与原 Jekyll 的区别

1. **构建速度**: Hugo 构建速度极快（<1秒 vs Jekyll 的数秒）
2. **单二进制文件**: Hugo 是单个可执行文件，无需依赖
3. **实时重载**: 开发时自动刷新浏览器
4. **模板语法**: 使用 Go 模板语法替代 Liquid

## 注意事项

- URL 结构保持与原来相同（基于标题 slug）
- 所有 CSS 样式与原博客完全一致
- 图片路径已更新为 Hugo 格式
- RSS 订阅地址为 `/index.xml`
