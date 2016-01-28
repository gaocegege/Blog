---
layout: post
title: "跨docker machine搭建Consul"
description: Consul试水
headline:
modified: 2016-01-28
category: Distributed system
tags: []
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

最近开始着手把[scrala](http://gaocegege.com/scrala/)做成分布式的，采取的方法是做成一个Master/Slave的架构，Slave是一个Long running的Actor，用Consul来帮助Master发现Slave。

于是就开始填坑了，第一步遇到的问题就是，如何启动Consul服务，这里我采取的是用docker的image，[progrium/consul](https://hub.docker.com/r/progrium/consul/)。为了更好地模拟分布式的环境，我想试试在Docker Machine之间能不能搭建起Consul Cluster。目前的尝试，在Docker Machine下的Docker中跑Consul的container的方法是做不到的。原因是虚拟层次太深了，不同Docker Machine中的Container互相发现不了IP。

各种遇到的坑就不说了，就说说我是如何跑整个Cluster的吧~

首先是创建两个Docker Machine，用来测试

	docker-machine create -d virtualbox <name>

之后，在第一个Machine上，我启动了三个Consul Server容器，一个Consul Client容器，其中只有一个Server暴露端口给host，Client也会暴露8500等等端口给host。

	$ docker run -d --name node1 -h node1 progrium/consul -server -bootstrap-expect 3
	$ JOIN_IP="$(docker inspect -f '{{.NetworkSettings.IPAddress}}' node1)"
	$ docker run -d --name node2 -h node2 progrium/consul -server -join $JOIN_IP
	$ docker run -d -p 8300:8300 -p 8301:8301 -p 8301:8301/udp -p 8302:8302 -p 8302:8302/udp --name node3 -h node3 progrium/consul -server -join $JOIN_IP
	$ docker run -d -p 8400:8400 -p 8500:8500 -p 8600:53/udp --name node4 -h node4 progrium/consul -join $JOIN_IP

这样就可以通过访问host的8500端口下的/ui来进行图形化的访问。这时候在service下应该有一个名字是consul的service，是跑在三个Server上的，在node下则应该有4个。

第一个Machine很成功，跑一个registrator，再跑redis，就会看到多一个service，那之后试试能不能在第二台上跑一个Client。在新的Machine上执行：

	$ docker run -d -p 8400:8400 -p 8500:8500 -p 8600:53/udp --name node5 -h node5 progrium/consul -join <IP of the Docker Machine 1>

docker给出的日志是这样的：

	==> WARNING: It is highly recommended to set GOMAXPROCS higher than 1
	==> Starting Consul agent...
	==> Starting Consul agent RPC...
	==> Joining cluster...
	    Join completed. Synced with 1 initial agents
	==> Consul agent running!
	         Node name: 'node5'
	        Datacenter: 'dc1'
	            Server: false (bootstrap: false)
	       Client Addr: 0.0.0.0 (HTTP: 8500, HTTPS: -1, DNS: 53, RPC: 8400)
	      Cluster Addr: 172.17.0.4 (LAN: 8301, WAN: 8302)
	    Gossip encrypt: false, RPC-TLS: false, TLS-Incoming: false
	             Atlas: <disabled>

	==> Log data will now stream in as it occurs:

	    2016/01/28 10:19:03 [INFO] serf: EventMemberJoin: node5 172.17.0.4
	    2016/01/28 10:19:03 [INFO] agent: (LAN) joining: [192.168.99.102]
	    2016/01/28 10:19:03 [INFO] serf: EventMemberJoin: node1 172.17.0.11
	    2016/01/28 10:19:03 [INFO] serf: EventMemberJoin: node4 172.17.0.14
	    2016/01/28 10:19:03 [INFO] serf: EventMemberJoin: node2 172.17.0.12
	    2016/01/28 10:19:03 [INFO] serf: EventMemberJoin: node3 172.17.0.15
	    2016/01/28 10:19:03 [INFO] agent: (LAN) joined: 1 Err: <nil>
	    2016/01/28 10:19:03 [ERR] agent: failed to sync remote state: No known Consul servers
	    2016/01/28 10:19:03 [INFO] consul: adding server node1 (Addr: 172.17.0.11:8300) (DC: dc1)
	    2016/01/28 10:19:03 [INFO] consul: adding server node2 (Addr: 172.17.0.12:8300) (DC: dc1)
	    2016/01/28 10:19:03 [INFO] consul: adding server node3 (Addr: 172.17.0.15:8300) (DC: dc1)
	    2016/01/28 10:19:05 [INFO] memberlist: Suspect node2 has failed, no acks received
	    2016/01/28 10:19:06 [INFO] memberlist: Suspect node4 has failed, no acks received
	    2016/01/28 10:19:06 [ERR] agent: failed to sync remote state: rpc error: failed to get conn: dial tcp 172.17.0.11:8300: no route to host
	    2016/01/28 10:19:07 [INFO] memberlist: Suspect node3 has failed, no acks received
	    2016/01/28 10:19:08 [INFO] memberlist: Suspect node1 has failed, no acks received

回到之前的ui，会发现node多了一个，但是是fail掉的，原因是新的node得到的其他node的IP是在Docker Machine 1上的docker container内部的IP，出了Docker Machine 1就找不到了。

那如何解决这个问题，之后想明白了。之前的尝试，是每个Machine上跑多个node，所以很难处理跨Machine间的node的互相发现问题。那改进下之前的方法，一个Machine上跑一个node，把这个node需要用到的端口全部映射到host上，这样就可以保证不会出现node只能与其他Machine的一个node互相发现的问题。因为现在每个Machine上只有一个node。

	# the ip of the docker machine is 192.168.99.102 and the docker0 is 172.17.42.1
	$ docker run -d -h node1 \
	    -p 192.168.99.102:8300:8300 \
	    -p 192.168.99.102:8301:8301 \
	    -p 192.168.99.102:8301:8301/udp \
	    -p 192.168.99.102:8302:8302 \
	    -p 192.168.99.102:8302:8302/udp \
	    -p 192.168.99.102:8400:8400 \
	    -p 192.168.99.102:8500:8500 \
	    -p 172.17.42.1:53:53/udp \
	    progrium/consul -server -advertise 192.168.99.102 -bootstrap-expect 2

	# the ip of the docker machine is 192.168.99.100 and the docker0 is 172.17.42.1
	$ docker run -d -h node2  \
	    -p 192.168.99.100:8300:8300 \
	    -p 192.168.99.100:8301:8301 \
	    -p 192.168.99.100:8301:8301/udp \
	    -p 192.168.99.100:8302:8302 \
	    -p 192.168.99.100:8302:8302/udp \
	    -p 192.168.99.100:8400:8400 \
	    -p 192.168.99.100:8500:8500 \
	    -p 172.17.42.1:53:53/udp \
	    progrium/consul -server -advertise 192.168.99.100 -join 192.168.99.102

这样就在两个Docker Machine上做成了一个Consul Cluster。这也是dockerhub上的那个镜像提出的在生产环境上使用docker构建Consul Cluster的方法。