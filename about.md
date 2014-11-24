---
layout: page
permalink: /about/index.html
title: 关于我
tags: [SJTU, SE]
imagefeature: 
chart: true
---

<!--<figure>
	<img src="{{ site.url }}/images/about.jpg" alt="about" height="300" width="700">
	<figcaption>SJTU and Me</figcaption>
</figure>-->

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

我叫高策，目前在上海交通大学软件学院软件工程专业读书，预计2016年毕业，这里是我的[LinkedIn](https://www.linkedin.com/in/gaoocegege)，是我至今为止的简历。

这里一共有<a href="{{ site.url }}">{{ site.posts | size }}篇博文</a>，其中第一篇文章是[start.sh](http://gaocegege.github.io/Blog/%E9%9A%8F%E7%AC%94/Hello-World/)，也是最满怀激动的文章，经过了各种各样的尝试，最终安定了下来，不得不说有一种成就感在里面。博客的Theme，需要感谢Github上[Hossain Mohd. Faysal](https://github.com/hmfaysal)创作的[Notepad](https://github.com/hmfaysal/Notepad)，使我得以摆脱设计界面的痛苦与纠结Orz。

博客多是记录自己认为需要记录的事情，也并没有什么特别的想法，只希望能与阅读这段文字的你一同进步Orz

欢迎光临。
        
<div class="cf"></div>

<section class="summer-disqus row">
<div class="small-12 columns">
<h1 class="summer-comments-header">Comments</h1>
<div id="disqus_thread"></div>
{% include duoshuo_comments.html %}
</div>
</section>

{% include signoff.html %} 