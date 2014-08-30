---
layout: page
permalink: /about/index.html
title: 关于我
tags: [SJTU, SE]
imagefeature: 
chart: true
---

<figure>
	<img src="{{ site.url }}/images/about.jpg" alt="about">
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

{% if featuredcount != 0 %}这里一共有<a href="{{ site.url }}/featured">{{ featuredcount }}篇博文</a>，你问我好不好看，我说好看，我就明确告诉你这一点=-=。{% endif %}其中第一篇文章是[start.sh](http://gaocegege.github.io/Blog/%E9%9A%8F%E7%AC%94/Hello-World/)，由此展开了写作=-=。

<div class="chart" id="chartdiv" style="width: 100%; height: 500px; margin-bottom: 20px;" ></div>
<figcaption>Number of Posts Breakdown</figcaption>



<!-- amCharts javascript code -->
<script type="text/javascript">
  AmCharts.makeChart("chartdiv",
    {
      "type": "pie",
      "pathToImages": "http://cdn.amcharts.com/lib/3/images/",
      "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
      "innerRadius": "40%",
      "labelRadius": 10,
      "labelRadiusField": "Not set",
      "startRadius": "10%",
      "colorField": "Not set",
      "descriptionField": "Not set",
      "hoverAlpha": 0.75,
      "outlineThickness": 0,
      "startEffect": "elastic",
      "titleField": "category",
      "valueField": "number-of-posts",
      "allLabels": [],
      "balloon": {},
      "legend": {
        "align": "center",
        "markerType": "square"
      },
      "titles": [],
      "dataProvider": [
{% assign tags_list = site.categories %}  
  {% if tags_list.first[0] == null %}
    {% for tag in tags_list %} 
        {
          "category": "{{ tag | capitalize }}",
          "number-of-posts": {{ site.tags[tag].size }}
        },
    {% endfor %}
  {% else %}
    {% for tag in tags_list %} 
        {
          "category": "{{ tag[0] | capitalize }}",
          "number-of-posts": {{ tag[1].size }}
        },
    {% endfor %}
  {% endif %}
{% assign tags_list = nil %}
      ]
    }
  );
</script>