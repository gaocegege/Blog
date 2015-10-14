---
layout: post
title: "WordPress迁移纪实"
description: 
headline:
modified: 2015-10-14
category: 随笔
tags: []
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

最近有一个使用WordPress的Blog需要从原本的服务器上迁移到新的服务器上，期间遇到了大大小小不少问题，这里记录下。

## 第一步-拷贝代码以及数据库

说到迁移，第一步就是先把WordPress所有的代码，以及数据库中的内容，全部传输到新的服务器上。这一步用scp命令可以比较直接地从原先的服务器传给现在的服务器。至于数据库的话，因为对于WordPress而言，图片是存放在文件系统中，只有文章等等这些文本是在数据库中的，大多数Blog对应的数据库规模都不会太大，所以可以直接dump成sql然后同样scp给现在的服务器。这里需要注意的一点就是如果将要迁移到的服务器没有密码验证的方式，只有密钥验证的方式，那可能需要在原本WordPress服务器上建立一对公钥密钥对，然后把公钥发给现在的服务器，才能使用scp进行传输。

## 第二步-构建

迁移说起来应该要注意一些细节，也是分为数据库和代码两步。

数据库迁移，就是把刚刚拿到的sql文件source给数据库就好了，这应该并没有什么。值得一提的是，对于数据库里面的内容，需要修改两处字段，就是wp_options下的option_name是home和siteurl的记录。这里修改这两项内容，有好多种做法，修改代码，修改数据库都可以。但不要登录后台去修改。这是因为，在整个WordPress迁移过来的时候，home和siteurl还是原本网站的配置。这时候登录后台会登录到原本网站的后台上。然后就会产生之前的服务器的home和siteurl指向了现在的服务器，现在服务器因为配置没有得到修改，指向原本服务器的奇葩情况。于是原本的服务器和现在的服务器都崩了。

代码迁移，就把WordPress的代码移动到Apache对应的目录下，使得Apache在运行的时候可以访问到，然后就是修改原本的数据库连接配置，连接到新的数据库上，就可以了。

## 关于图片

至于说图片这些，因为我要做的只是迁移服务器，其实域名还是不变的，所以图片不需要做什额外的设定。只不过在处理首页的缩略图的时候，如果域名还没有绑定到新的服务器上时，会出现一点问题，那就是调用themes下的timthumb.php去获得缩略图的时候，会报错：

>"You may not fetch images from that site. To enable this site in timthumb, you can either add it to $ALLOWED_SITES and set ALLOW_EXTERNAL=true. Or you can set ALLOW_ALL_EXTERNAL_SITES=true, depending on your security needs."

其实就是因为访问图片时候还是通过域名访问的，但其实不需要在意，因为如果域名是早晚要绑定到新的服务器上的，就不用管这过渡期间的错误，如果一定要看看效果，可以将themes文件夹下timthumb.php的ALLOW_ALL_EXTERNAL_SITES置为TRUE，不过这可能会导致Pharma hack。不过，如果是小一点的Blog，也没必要为了安全做太多事情，那就有点过度设计了。