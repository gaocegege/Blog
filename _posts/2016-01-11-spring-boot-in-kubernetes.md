---
layout: post
title: "在Kubernetes中的Spring Boot项目部署"
description: 容器这么火，不学学怎么行
headline:
modified: 2016-01-11
category: kubernetes
tags: [kubernetes, spring boot]
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

近来在做一个项目，是用Spring Boot来实现的微服务架构。基本上所有的后端都是用Sring Boot来实现的一个个Module，现在项目做的差不多了，打算把它部署在Kubernetes集群上，遇到了一点点小问题，所幸都克服了，这里记录下遇到的问题以及相应的解决方法。

首先是容器集群的搭建，这个问题就挺大的。因为国内的GFW，所以很多东西是访问不到的，尤其是谷歌系的很多东西，比如golang，再比如kubernetes。之前一直希望能够让kubernetes走shadowsocks的代理，但是现在支持不是很好，主要是因为shadowsocks代理不了terminal里的访问，虽然有一些工具提供了一些解决办法，比如proxychains，等等，但是都不是很稳定。Docker已经有了Pull Request，支持了Socks5代理，但是整体来说也不是特别能用。这个问题到底应该如何解决，挂VPN，或者挂http proxy都可以解决，不过容器集群不是我搭起来的，在这里就不写这方面的事情了。

容器集群搭建起来后，就开始要在集群上搭建我们的服务了。基本来说，正常的Web应用都是由三个部分构成，分别是前端，后端，数据库，有的项目中前端和后端代码是在一起的，这里就记录一下，如何在Kubernetes中建立起一个数据库，同时在容器中运行后端的代码。

先了解下Mysql的Image是怎么实现的。在[dockerhub](https://hub.docker.com/_/mysql/)上，可以看到Mysql的[Dockerfile](https://github.com/docker-library/mysql/blob/ee6ac037ab647e0de9dbeb4e064610a95cb6df4a/5.7/Dockerfile)，大概可以了解它做的事情。其中我们需要用到的就是对于密码的设定，和存放数据的位置的挂载。Mysql镜像允许通过环境变量的方式设置数据库中的root用户的密码，同时，还可以挂载目录到容器中的/var/lib/mysql下。/var/lib/mysql是用来存放mysql的数据文件的，比如新建一个schema，就会在/var/lib/mysql下新建一个目录，等等。mysql的所有用户建立的数据库和表都会存放在这里，所以当需要在容器中运行Mysql时，可以挂载上自己的数据目录，让容器中的数据库运行实例可以访问到自己数据目录中的表。

了解了Mysql镜像的工作原理后，就开始着手来做事了。首先确认我们的架构，后端是一个Pod，数据库也是一个Pod，两者都需要一个Service，同时，数据库为了能够持久化数据，而不是每次容器挂了数据就没了，需要挂载一个数据目录到容器中。但是Kubernetes本身是分布式的，为了解决这个问题就需要一个网络文件系统，或者说分布式文件系统，来使得Kubernetes的每个Kubelet都能访问到这个数据目录。Kubernetes中为了解决这种问题，有两个抽象，叫做[Persist Volume和Persist Volume Claim](http://kubernetes.io/v1.1/docs/user-guide/persistent-volumes.html)。是专门用来做数据持久化的，而且本身支持NFS，即网络文件系统。Persist Volume可以当成是创建一个硬盘资源，Persist Volume Claim可以当成是把创建的硬盘创建成一个可以挂载的Volume。**其实比较好奇为什么要有两个抽象，而不是合并成一个，感觉这一定是出于某种目的。**总之有了这两个抽象，就可以非常简单地解决持久化数据库存储的问题。当然，性能之类的还没有测试过，之后会考虑做下测试。

目前来看，我们需要创建一个Persist Volume，和一个Persist Volume Claim，来进行持久的数据存储，然后创建一个数据库的Pod，还有对应的Service，最后创建一个后端的Pod，以及对应的Service，有这样6个对象，就可以让项目真正运行在Kubernetes集群上了。下面就看下如何具体去做。

看看怎么创建一个Persist Volume，首先，需要把NFS挂在本地的目录下，在我的环境下，就是挂在了/home/administrator/data下，server的IP是192.168.0.110。所以对应的创建文件就是这样的：

	apiVersion: v1
	kind: PersistentVolume
	metadata:
	  name: zuims-mysql
	  labels:
	    app: zuims
	spec:
	  capacity:
	    storage: 5Gi
	  accessModes:
	    - ReadWriteMany
	  persistentVolumeReclaimPolicy: Recycle
	  nfs:
	    path: /home/administrator/data
	    server: 192.168.0.110

然后需要创建一个Claim：

	kind: PersistentVolumeClaim
	apiVersion: v1
	metadata:
	  name: zuims-mysql
	  labels:
	    app: zuims
	spec:
	  accessModes:
	    - ReadWriteMany
	  resources:
	    requests:
	      storage: 5Gi

为什么我觉得一个抽象就够了，因为实在是没看懂这个Claim存在的必要。好吧，之后就相当于创建好了一个来自网络文件系统的硬盘，然后做成可以挂载的Volume，接下来可以创建Mysql的Pod了：

	apiVersion: v1
	kind: Pod
	metadata:
	  name: mysql
	  labels:
	    name: mysql
	spec:
	  containers:
	    - image: mysql:5.7
	      name: mysql
	      env:
	        - name: MYSQL_ROOT_PASSWORD
	          value: 'YOUR_PASSWORD'
	      ports:
	        - containerPort: 3306
	          name: mysql
	      volumeMounts:
	        - name: mysql-persistent-storage
	          mountPath: /var/lib/mysql
	  volumes:
	    - name: mysql-persistent-storage
	      persistentVolumeClaim:
	        claimName: zuims-mysql

在这里做的事情就是指定下root用户的密码，然后指定下将网络文件系统下的那个目录挂在容器里的/var/lib/mysql下。根据前面对Mysql的Image的介绍，就知道这是为什么可以实现持久化存储了。接下来就是创建一个Service，没啥好说的。

	apiVersion: v1
	kind: Service
	metadata:
	  labels:
	    name: mysql
	  name: mysql
	spec:
	  ports:
	    - port: 3306
	  selector:
	    name: mysql

接下来看看后端需要做什么。首先，Spring Boot的配置文件需要做些许的修改：

	# IP of the docker0
	spring.datasource.url = jdbc:mysql://mysql:3306/mydb?useUnicode=true&characterEncoding=UTF-8
	spring.datasource.username = root
	spring.datasource.password = YOUR_PASSWORD
	spring.datasource.driverClassName=com.mysql.jdbc.Driver

	server.port=8001
	server.address=0.0.0.0

	...

主要的改动是数据连接的IP需要改成之前跑的Mysql的Service的name，这样Kubernetes就会通过DNS来找到Service对应的Pod的真正IP，这是任老师告诉我的。除此之外，就没什么了，接下来就是Pod和Service，也没什么大不了的，看看就好。

	apiVersion: v1
	kind: Pod
	metadata:
	  name: zuims-user-service-1
	  labels:
	    app: zuims
	spec:
	  containers:
	  - name: zuims
	    image: zuims/user-service:test
	    ports:
	    - containerPort: 8001


	apiVersion: v1
	kind: Service
	metadata:
	  name: zuims-user-service
	  labels:
	    app: zuims
	spec:
	  selector:
	    app: zuims
	  ports:
	  - port: 80
	    targetPort: 8001

## 几个问题

为什么要用网络的文件系统，不用本地的文件系统。这是因为Kubernetes是分布式的，数据库容器可能跑在任意的Kubelet上，所以如果要持久化数据，肯定要有一个分布式的文件系统供其使用。

为什么不把数据库和后端放在同一个Pod中，这样通信不是更方便么。从我的理解来看，后端的Pod是可以支持多副本的。而如果跟数据库放在了一个Pod中，就会被数据库牵连的不能做多副本。因为数据库容器的实现是使用文件系统的一个目录作为数据目录，而如果有多个容器使用了同一个目录作为数据目录，Mysql应该不会支持这种样子的并发吧。所以在网上可以看到的大多数的做法都是把数据库单独作为一个Pod，这样来实现的。