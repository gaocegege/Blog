---
layout: page
permalink: /about/index.html
title: 关于我
tags: [SJTU, SE]
imagefeature: 
chart: true
---

<figure>
	<img src="{{ site.url }}/images/about.jpg" alt="about" height="300" width="700">
	<figcaption>SJTU and Me</figcaption>
</figure>

{% assign total_words = 0 %}
{% assign total_readtime = 0 %}
{% assign featuredcount = 0 %}

{% for post in site.posts %}
    {% assign post_words = post.content | strip_html | number_of_words %}
    {% assign ert = post_words | divided_by:180 %}
    {% assign ertremainder = post_words | modulo:180 %}
        {% if ertremainder >= 90 %}
            {% assign readtime = ert | plus:1 %}
        {% else %}
            {% assign readtime = ert %}
        {% endif %}
    {% assign total_words = total_words | plus: post_words %}
    {% assign total_readtime = total_readtime | plus: readtime %}
    {% if post.featured %}
    {% assign featuredcount = featuredcount | plus: 1 %}
    {% endif %}
{% endfor %}

我叫高策，目前在上海交通大学读书=-=，这是我的个人博客。基本来说建立博客的目的是为了记录一下自己的学习生活，防止遗忘一些学到的姿势。至于是否贴合初衷，就不好说了=-=。

这里一共有<a href="{{ site.url }}">{{ site.posts | size }}篇博文</a>，你问我好不好看，我说好看，我就明确告诉你这一点=-=。其中第一篇文章是[start.sh](http://gaocegege.github.io/Blog/%E9%9A%8F%E7%AC%94/Hello-World/)，也是最满怀激动的文章，经过了各种各样的尝试，最终安定了下来，不得不说有一种成就感在里面。

博客的Theme，需要感谢Github！这么美丽的界面，是套用了[Hossain Mohd. Faysal](https://github.com/hmfaysal)大大创作的[Notepad](https://github.com/hmfaysal/Notepad)，以至于自己只是简简单单地添添画画就完成了。虽然有些地方对中文来说不太美观，但是也只是小事情，自己以后慢慢修改就好。

最后，欢迎光临。

{% include signoff.html %} 
        
<div class="cf"></div>
{% if site.disqus_shortname and page.comments == true %}
<section class="summer-disqus row">
<div class="small-12 columns">
<h1 class="summer-comments-header">Comments</h1>
<div id="disqus_thread"></div>
{% include disqus_comments.html %}
</div>
</section>
{% endif %}