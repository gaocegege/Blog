# 高策的个人博客

这是部署在 <https://gaocegege.com/Blog> 的 Jekyll 博客，使用 GitHub Pages 构建。

## 本地预览

需要 Ruby、Bundler，以及首次安装依赖时的网络连接：

```bash
bundle config set --local path .bundle/gems
bundle install
bundle exec jekyll serve
```

本地地址通常是 <http://127.0.0.1:4000/Blog/>。生产域名和子路径分别由 `_config.yml` 中的 `url` 与 `baseurl` 管理，模板中的站内链接应使用 Jekyll 的 `relative_url` 或 `absolute_url`，不要手工拼接这两个配置项。

## 新建文章

```bash
bin/new-post article-slug "文章标题" --category genai --section tech
```

`section` 可取：

- `tech`：显示在“编程”页面。
- `life`：显示在“消遣”页面。

历史文章仍使用 `featured` 区分这两个分区，页面模板保留了兼容逻辑。不要直接修改历史文章的 `category`：当前永久链接包含分类名，修改后会改变旧 URL。

Giscus 继续使用文章标题关联已有讨论。已发布文章如果需要改标题，应先确认对应评论迁移方案。

## 发布前检查

```bash
bundle exec jekyll build --strict_front_matter
git status
```

构建产物在 `_site/`，不提交到仓库。确认页面和链接无误后，再提交并推送 `gh-pages` 分支。
