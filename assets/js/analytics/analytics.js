  AmCharts.makeChart("category",
    {
      "type": "pie",
      "pathToImages": "http://cdn.amcharts.com/lib/3/images/",
      "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
      "theme": "none",
      "legend": {
        "markerType": "circle",
        "position": "right",
        "marginRight": 80,    
        "autoMargins": false
      },
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
      // "legend": {
      //   "align": "center",
      //   "markerType": "square"
      // },
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

  AmCharts.makeChart("tag",
    {
      "type": "pie",
      "pathToImages": "http://cdn.amcharts.com/lib/3/images/",
      "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
      "theme": "light",
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
{% assign tags_list = site.tags %}  
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

// var chart = AmCharts.makeChart("date",{
//   "type": "serial",
//   "theme": "patterns",
//   "categoryField": "category",
//   "graphs": [
//     {
//       "valueField": "value"
//     }
//   ],
//   "dataProvider": [
//     {
//       "category": "category 1",
//       "value": 8,
//     },
//     {
//       "category": "category 2",
//       "value": 4,
//     }
//   ]
// });
  var chart = AmCharts.makeChart("date", {
    "type": "serial",
    "theme": "none",
     "pathToImages": "http://www.amcharts.com/lib/3/images/",
    // "valueAxes": [{
    //     "logarithmic": true,
    //     "dashLength": 1,
    //     "guides": [{
    //         "dashLength": 6,
    //         "inside": true,
    //         "label": "average",
    //         "lineAlpha": 1,
    //         "value": 90.4
    //     }],
    //     "position": "left"
    // }],
    "graphs": [{
        "bullet": "round",
        "id": "g1",
        "bulletBorderAlpha": 1,
        "bulletColor": "#FFFFFF",
        "bulletSize": 7,
        "lineThickness": 2,
        "title": "count",
        "type": "smoothedLine",
        "useLineColorForBulletBorder": true,
        "valueField": "count"
    }],
    "chartScrollbar": {},
    "chartCursor": {
        "cursorPosition": "mouse"
    },
    "dataDateFormat": "YYYY-MM-DD",
    "categoryField": "date",
    "categoryAxis": {
        "parseDates": true
    },
    "dataProvider": [
    //get the post list
    {% assign post_list = site.posts %}
    {% assign last_time = post_list | first %}
    {% assign last_time = last_time.date %}
    {% assign count = 1 %}
    {% for post in post_list %}{% if post.date == last_time %}{% assign count = count | plus: 1 %}{% else %}
    {
      "date": "{{ last_time | date: "%Y-%m-%d" }}",
      "count": "{{ count }}"
    },{% assign last_time = post.date %}{% assign count = 1 %}{% endif %}{% endfor %}
    {
      "date": "{{ last_time | date: "%Y-%m-%d" }}",
      "count": "{{ count }}"
    },{% assign last_time = nil %}{% assign count = nil %}
    ]
});