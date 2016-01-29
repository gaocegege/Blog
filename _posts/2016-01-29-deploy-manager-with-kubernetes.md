---
layout: post
title: "deploy manager中与kubernetes交互部分的代码阅读记录"
description: 愿永远沉迷在代码的世界中无法自拔
headline:
modified: 2016-01-29
category: Kubernetes
tags: []
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

今天做了好多事，搬砖，出门吃饭，还有就是为了做毕设读了读kubernetes下的一个子项目，[kubernetes/deployment-manager](https://github.com/kubernetes/deployment-manager)（下称dm）有关调用kubectl部署内容到kubernetes集群部分的代码。这里写一下自己的阅读记录吧~

读完dm的[design.md](https://github.com/kubernetes/deployment-manager/blob/master/docs/design/design.md)，会发现在实现部署到kubernetes集群上时，dm专门抽象出了一个service，叫做resourcifier来专门处理来自manager的请求。其实逻辑非常简练，先看看resourcifier的代码。

	var configurations = []Route{
		{"ListConfigurations", "/configurations/{type}", "GET", listConfigurationsHandlerFunc, ""},
		{"GetConfiguration", "/configurations/{type}/{name}", "GET", getConfigurationHandlerFunc, ""},
		{"CreateConfiguration", "/configurations", "POST", createConfigurationHandlerFunc, "JSON"},
		{"DeleteConfiguration", "/configurations", "DELETE", deleteConfigurationHandlerFunc, "JSON"},
		{"PutConfiguration", "/configurations", "PUT", putConfigurationHandlerFunc, "JSON"},
	}

	func getConfigurator() *configurator.Configurator {
		kubernetesConfig := &util.KubernetesConfig{
			KubePath:       *kubePath,
			KubeService:    *kubeService,
			KubeServer:     *kubeServer,
			KubeInsecure:   *kubeInsecure,
			KubeConfig:     *kubeConfig,
			KubeCertAuth:   *kubeCertAuth,
			KubeClientCert: *kubeClientCert,
			KubeClientKey:  *kubeClientKey,
			KubeToken:      *kubeToken,
			KubeUsername:   *kubeUsername,
			KubePassword:   *kubePassword,
		}
		return configurator.NewConfigurator(util.NewKubernetesKubectl(kubernetesConfig))
	}

在init的时候会创建出一个configurator，这个configurator其实只是简单地封装了kubernetes的kubectl。其中的KubePath，是通过命令行参数传进来的，写好在Dockerfile中的。然后通过注册REST的API，来向manager提供服务。resourcifier做的事情到这里就结束了，下面看看manager中是怎么跟resourcifier交互的。

	func newManager(cp common.CredentialProvider) manager.Manager {
		registryProvider := registry.NewDefaultRegistryProvider(cp)
		resolver := manager.NewTypeResolver(registryProvider)
		expander := manager.NewExpander(getServiceURL(*expanderURL, *expanderName), resolver)
		deployer := manager.NewDeployer(getServiceURL(*deployerURL, *deployerName))
		r := repository.NewMapBasedRepository()
		service := registry.NewInmemRegistryService()
		credentialProvider := cp
		return manager.NewManager(expander, deployer, r, registryProvider, service, credentialProvider)
	}

	type Deployer interface {
		GetConfiguration(cached *common.Configuration) (*common.Configuration, error)
		CreateConfiguration(configuration *common.Configuration) (*common.Configuration, error)
		DeleteConfiguration(configuration *common.Configuration) (*common.Configuration, error)
		PutConfiguration(configuration *common.Configuration) (*common.Configuration, error)
	}

	func NewDeployer(url string) Deployer {
		return &deployer{url, 15}
	}

其中负责与resourcifier进行交互的是deployer，不造为什么谷歌写代码都爱用xxxxer。deployer被初始化的时候，会先去找resourcifier的url，在kubernetes上，找的方法是用DNS来找Service。代码里还写了很多其他方法，但是如果按照readme中的启动方法启动的话是会通过DNS来找的。找到之后就会创建一个实现了Deployer接口的结构，然后就可以用这个结构来与resourcifier进行交互。

代码逻辑其实很简单啦，这样做有什么好处呢，微服务吧，manager和resourcifier跑在两个容器里，通过REST API交互，看了之后发现对毕设还是很有帮助的。在扩展方面，如果之后不是单纯支持kubernetes集群，可以添加少部分manager代码，新写一个resourcifier，应该就可以实现了，挺方便扩展的。