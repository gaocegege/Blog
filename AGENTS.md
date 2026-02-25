# AGENTS.md - Project Guide for AI Coding Agents

This file provides essential information about this Jekyll blog project for AI coding agents.

## Project Overview

This is a **personal blog** (博客) built with [Jekyll](https://jekyllrb.com/), a static site generator. The blog is authored by 高策 (Gao Ce) and hosted on GitHub Pages.

- **Project Type**: Jekyll static site generator blog
- **Primary Language**: Chinese (Simplified) - 简体中文
- **Theme**: Notepad-China (modified version of [Notepad](https://github.com/hmfaysal/Notepad) theme)
- **URL**: http://gaocegege.com/Blog
- **Total Posts**: ~170+ blog posts in `_posts/` directory

## Technology Stack

| Component | Technology |
|-----------|------------|
| Static Site Generator | Jekyll |
| Language | Ruby |
| Markdown Processor | kramdown |
| Syntax Highlighter | pygments / highlight.js |
| CSS Framework | Foundation (ZURB Foundation) |
| Icons | Font Awesome |
| Charts | amCharts |
| Comments | Giscus (GitHub Discussions) |
| Analytics | Google Analytics, Baidu Analytics |

## Project Structure

```
├── _config.yml          # Jekyll configuration file
├── _layouts/            # HTML layout templates
│   ├── home.html        # Homepage layout
│   ├── post.html        # Blog post layout
│   └── page.html        # Static page layout
├── _includes/           # Reusable HTML components
│   ├── head.html        # HTML head section
│   ├── footer.html      # Site footer
│   ├── scripts.html     # JavaScript includes
│   ├── giscus_comments.html  # Giscus comment system
│   ├── disqus_comments.html  # Disqus comments (legacy)
│   ├── duoshuo_comments.html # Duoshuo comments (legacy)
│   ├── share.html       # Social sharing buttons
│   └── signoff.html     # Post sign-off section
├── _posts/              # Blog posts (Markdown files)
│   └── YYYY-MM-DD-title.md   # Post naming convention
├── assets/              # Static assets
│   ├── css/             # Stylesheets
│   │   ├── style.css    # Main stylesheet
│   │   ├── post.css     # Post-specific styles
│   │   └── vendor/      # Third-party CSS
│   └── js/              # JavaScript files
│       ├── vendor/      # Third-party JS (highlight.js, amCharts, etc.)
│       └── summer.js    # Custom theme JS
├── images/              # Blog images and media
├── index.html           # Homepage with post listing
├── about.md             # About page
├── categories.html      # Category index page
├── tags.html            # Tag index page
├── featured.html        # Featured posts page
├── relaxed.html         # Non-featured posts page
├── analytics.html       # Statistics dashboard with charts
├── opensource.md        # Open source contributions page
├── rss.xml              # RSS feed
├── sitemap.xml          # XML sitemap for SEO
├── search.json          # JSON search index
├── rakefile             # Ruby tasks for creating posts/pages
└── update.sh            # Git deployment script
```

## Post Structure

Blog posts are stored in `_posts/` with the filename format `YYYY-MM-DD-title.md`.

Each post must have YAML front matter:

```yaml
---
layout: post
title: "Post Title"
description: "Brief description"
headline: "Optional headline"
modified: YYYY-MM-DD
category: category-name
tags: [tag1, tag2]
imagefeature: featured-image.jpg  # Optional featured image
mathjax: true/false               # Enable MathJax for math
chart: true/false                 # Enable amCharts
comments: true/false              # Enable comments
featured: true/false              # Mark as featured post
---
```

## Build Commands

### Local Development

```bash
# Serve the site locally (default Jekyll command)
jekyll serve

# Serve with baseurl config for local testing
jekyll serve --baseurl ''

# Build the site
jekyll build
```

### Using Rake Tasks

The `rakefile` provides helper tasks:

```bash
# Create a new post
rake new['Post Title']

# Create a new page
rake newpage['Page Title']

# Set development environment
rake env:dev

# Set production environment
rake env:pro
```

### Deployment

Use the provided shell script for deployment:

```bash
./update.sh
```

This script:
1. Shows git status
2. Prompts for files to add
3. Prompts for commit message
4. Commits and pushes to remote

## Configuration (_config.yml)

Key configuration sections:

- **Site metadata**: title, description, logo, baseurl, url
- **Owner info**: name, avatar, email, social links (GitHub, Weibo, etc.)
- **Analytics**: Google Analytics UA code, Baidu Analytics
- **Comments**: `comments_sys: giscus` (current), also supports `disqus`
- **Navigation**: `links` array defines the top menu
- **Build settings**: markdown engine, highlighter, pagination, permalink structure
- **Prose.io integration**: For web-based editing

## Code Style Guidelines

### Markdown Writing

- Use Chinese (Simplified) for post content
- Use YAML front matter for all post metadata
- Categories use lowercase (e.g., `personal`, `engineering`, `physics`)
- Tags can be multiple, separated by spaces in front matter

### HTML/Liquid Templates

- Use 4-space indentation in HTML/Liquid templates
- Use Liquid tags for dynamic content: `{{ variable }}`, `{% logic %}`
- Follow existing include patterns for reusable components

### CSS

- Main styles in `assets/css/style.css` and `assets/css/post.css`
- Vendor libraries in `assets/css/vendor/`
- Uses Foundation CSS framework

### JavaScript

- jQuery-based for DOM manipulation
- Foundation JS for UI components
- Custom theme JS in `assets/js/summer.js`

## Key Features

1. **Responsive Design**: Mobile-friendly with Foundation framework
2. **Comment Systems**: 
   - Giscus (current, via GitHub Discussions in `gaocegege/blog-comments` repo)
   - Disqus (legacy support)
   - Duoshuo (legacy Chinese service)
3. **Syntax Highlighting**: highlight.js with various themes
4. **Math Support**: MathJax for LaTeX math rendering
5. **Charts**: amCharts integration for data visualization
6. **Social Sharing**: Built-in share buttons
7. **Analytics**: Google Analytics and Baidu Analytics tracking
8. **SEO**: Sitemap, RSS feed, Open Graph meta tags

## Adding New Content

### Creating a Blog Post

```bash
rake new['My New Post Title']
```

Or manually create a file `_posts/YYYY-MM-DD-my-new-post.md` with proper front matter.

### Creating a Static Page

```bash
rake newpage['Page Title']
```

Or create a `.md` or `.html` file with:
- `layout: page` front matter
- `permalink: /path/index.html` for URL structure

### Adding Images

1. Place images in `images/` directory (preferably in subdirectories by post)
2. Reference in posts: `![Alt text]({{ site.url }}/images/path/to/image.jpg)`
3. For featured images, use `imagefeature: filename.jpg` in front matter

## Testing

- No automated tests are configured for this project
- Manual testing via local Jekyll server
- Verify links and images work correctly
- Check responsive design on different screen sizes

## Security Considerations

- This is a static site with no server-side processing
- Comments are handled by external services (Giscus/Disqus)
- No user authentication or sensitive data storage
- Keep Jekyll and dependencies updated

## Useful Resources

- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [Liquid Template Language](https://shopify.github.io/liquid/)
- [Kramdown Syntax](https://kramdown.gettalong.org/syntax.html)
- [Foundation Docs](https://get.foundation/sites/docs/)
