---
layout: post
title: "Kubernetes Operator 测试面面观"
description: 
headline:
modified: 2019-06-30
category: Kubernetes
tags: [Kubernetes]
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

软件测试是一门工程技术，更是一门艺术。维护良好，质量过硬的测试用例能够大大提高软件开发时的幸福感。这篇文章通过对目前一些比较成熟的 Kubernetes Operator 的测试方案与方法的介绍，分析目前对 Kubernetes Operator 进行测试的一些最佳实践。

## 单元测试

首先，让我们先把镜头对准单元测试。单元测试又称为模块测试，是针对程序模块（软件设计的最小单位）来进行正确性检验的测试工作，这一测试是软件质量的第一道保障。

### Kubernetes 的做法

在 [tf-operator][] 中，我们采取了跟 Kubernetes 内置的 controller 类似的测试方案（例子可见 [job_controller_test.go](https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/job/job_controller_test.go)）。

如下面的代码所示，我们通过 Fake KubeConfig，创建了 Fake Clienset 和 Informer。然后利用 Indexer 将测试的数据注入到 Informer 的 Cache 中，同时把 Informer 的 Sync 状态置为 AlwaysReady。最后，我们还需要使用 Fake PodControl 和 ServiceControl。这一操作使得我们不会真正地在 Kubernetes 中创建对象，而是只单纯地进行一个记录。

```go
config := &rest.Config{
    Host: "",
    ContentConfig: rest.ContentConfig{
        GroupVersion: &tfv1.SchemeGroupVersion,
    },
}
option := options.ServerOption{}
tfJobClientSet := tfjobclientset.NewForConfigOrDie(config)
ctr, kubeInformerFactory, _ := newTFController(config, kubeClientSet, kubeBatchClientSet, tfJobClientSet, controller.NoResyncPeriodFunc, option)
ctr.tfJobInformerSynced = testutil.AlwaysReady
ctr.PodInformerSynced = testutil.AlwaysReady
ctr.ServiceInformerSynced = testutil.AlwaysReady
tfJobIndexer := ctr.tfJobInformer.GetIndexer()
fakePodControl := ctr.PodControl.(*controller.FakePodControl)
fakeServiceControl := ctr.ServiceControl.(*control.FakeServiceControl)

// Inject the test data into informer cache.
podIndexer := kubeInformerFactory.Core().V1().Pods().Informer().GetIndexer()
testutil.SetPodsStatuses(podIndexer, tfJob, testutil.LabelWorker, tc.pendingWorkerPods, tc.activeWorkerPods, tc.succeededWorkerPods, tc.failedWorkerPods, nil, t)
testutil.SetPodsStatuses(podIndexer, tfJob, testutil.LabelPS, tc.pendingPSPods, tc.activePSPods, tc.succeededPSPods, tc.failedPSPods, nil, t)

serviceIndexer := kubeInformerFactory.Core().V1().Services().Informer().GetIndexer()
testutil.SetServices(serviceIndexer, tfJob, testutil.LabelWorker, tc.activeWorkerServices, t)
testutil.SetServices(serviceIndexer, tfJob, testutil.LabelPS, tc.activePSServices, t)
```

随后，我们将状态更新的函数也 Fake 掉，将其赋值到内存的一个对象中，以便在后续的测试中进行状态的比对。通过手动地调用 SyncTFJob 的方式，利用之前我们自己手动构造的 Cache 进行状态的 Sync。最后，就是根据构造的对象和实际更新后的对象的比对，来判断 Operator 在 Sync 的过程中是否达到了期望的状态。

```go
var actual *tfv1.TFJob
ctr.updateStatusHandler = func(tfJob *tfv1.TFJob) error {
    actual = tfJob
    return nil
}

// Run the test logic.
tfJob := testutil.NewTFJob(tc.worker, tc.ps)
unstructured, err := testutil.ConvertTFJobToUnstructured(tfJob)
if err != nil {
    t.Errorf("Failed to convert the TFJob to Unstructured: %v", err)
}

if err := tfJobIndexer.Add(unstructured); err != nil {
    t.Errorf("Failed to add tfjob to tfJobIndexer: %v", err)
}

forget, err := ctr.syncTFJob(testutil.GetKey(tfJob, t))
// We need requeue syncJob task if podController error
if tc.ControllerError != nil {
    if err == nil {
        t.Errorf("%s: Syncing jobs would return error when podController exception", name)
    }
}
// ...
if int32(len(fakePodControl.Templates)) != tc.expectedPodCreations {
    t.Errorf("%s: unexpected number of pod creates.  Expected %d, saw %d\n", name, tc.expectedPodCreations, len(fakePodControl.Templates))
}
```

这一方法利用了 Kubernetes 的一些机制，绕过了对 Kubernetes API Server 和其他组件的依赖，直接利用 Informer 针对 Operator 的代码逻辑进行测试，可以测试单次的 Sync 过程中，Operator 是否如期望一般工作。

### etcd-operator 的做法

[etcd-operator][] 据我所知，是问世最久的 Operator，而 Operator 这一模式也是由 CoreOS 提出的。因此了解 etcd-operator 能起到以史为镜的作用。目前 etcd-operator 在实现中仍然没有像目前主流的 Operator 一样采用 Work Queue 的方式来避免阻塞的问题，而是在 Informer 中直接去进行处理的。而它的处理的逻辑被统一写成了

```go
type Event struct {
	Type   kwatch.EventType
	Object *api.EtcdCluster
}

// handleClusterEvent returns true if cluster is ignored (not managed) by this instance.
func (c *Controller) handleClusterEvent(event *Event) (bool, error) {
	// ...
	switch event.Type {
	case kwatch.Added:
        // Deal with add logic
        // ...
	case kwatch.Modified:
		// Deal with modify logic
        // ...
	case kwatch.Deleted:
		// Deal with delete logic
        // ...
	}
	return false, nil
}
```

因此，在做单元测试的时候就相对容易些，可以直接构造 Event 对象，来进行测试。

### Kubebuilder-generated Operator 的做法

Kubebuilder 的测试很难说是不是传统意义上的单元测试，它背后依赖的是 `"sigs.k8s.io/controller-runtime/pkg/envtest".Environment`。在运行时，它会启动一个真正的 API Server 和 etcd，随后把 CRD 注册到 Scheme 中并且把 Operator 运行起来。但值得注意的是，它不会启动 Controller Manager，这也意味着来自 API Server 的关于 Kubernetes 资源的事件不会真正被处理。

它与其他的做法有一些比较大的不同。首先，它会需要运行一个真正的 API Server 和 etcd，用来做对象存储。这就意味着在测试时可以使用真正的 Clientset 对 API Server 进行各种请求。

```go
func TestMain(m *testing.M) {
	t := &envtest.Environment{
		ControlPlaneStartTimeout: controlPlaneTimeout,
		ControlPlaneStopTimeout:  controlPlaneTimeout,
		CRDDirectoryPaths:        []string{filepath.Join("..", "..", "..", "config", "crds")},
	}
	apis.AddToScheme(scheme.Scheme)

	var err error
	if cfg, err = t.Start(); err != nil {
		stdlog.Fatal(err)
	}

	code := m.Run()
	t.Stop()
	os.Exit(code)
}
```

其次，它会运行一个真正的 Operator，而不只是通过手动调用 Sync 过程的方式进行测试。如下代码所示，inner 这一对象就是真正的 Operator 的逻辑，而在这一函数中对其进行了再次的封装。利用了一个没有缓冲的 Channel 对其进行了执行的控制。根据 Golang 的内存模型，不带缓冲的 Channel 的接收操作 happens-before 相应 Channel 的发送操作完成。利用这一特性，在同一个测试用例中，测试的对象可以被多次的 Sync，每次 Sync 的状态都可以被检查。如果需要检查其中的 `reconcile.Result` 的值，如 `Requeue` 等，也可以改动这部分的逻辑来扩展。

```go
// SetupTestReconcile returns a reconcile.Reconcile implementation that delegates to inner and
// writes the request to requests after Reconcile is finished.
func SetupTestReconcile(inner reconcile.Reconciler) (reconcile.Reconciler, chan reconcile.Request) {
	requests := make(chan reconcile.Request)
	fn := reconcile.Func(func(req reconcile.Request) (reconcile.Result, error) {
		result, err := inner.Reconcile(req)
		requests <- req
		return result, err
	})
	return fn, requests
}
```

这样做的优势是可以在单个测试中多次 Sync，并且依赖真实的 API Server，可以直接简单地利用 Clientset 进行操作。而劣势也是依赖真实的 API Server，而有些 CI 系统对多进程支持不好，真正在持续集成环境下运行时会有各种各样的问题。

## 端到端测试

端到端测试是利用真实的外部组件，将系统当做黑盒，站在终端用户的角度进行的测试。这里的“真实的组件”指的就是 Kubernetes 还有一些外部依赖。相比于单元测试，端到端测试需要依赖一个真实的 Kubernetes 集群，同时由于其黑盒属性，就有了更多不同的选型。

### Kubernetes 的做法

首先介绍下 Kubernetes 自身的 Controller 的 e2e 测试是如何做的。

Kubernetes 的端到端测试依赖一个关键的抽象，也就是 `Framework`。Framework 会负责把需要的 Client 创建好。同时，Framework 会为测试创建一个 Namespace，当前的测试用例会在这个 Namespace 下运行，这样从设计上就避免了并行测试可能引起的冲突。是一个非常有价值的特性。这也使得 Kubernetes 的测试用例可以并行地去运行。

其实 Kubernetes 的端到端测试有许多值得学习的地方，包括其整体的原则和哲学，到设计与实现。限于篇幅原因，这里不过多介绍了。

### Operator-SDK generated Operator 的做法

Operator-SDK 的做法和 etcd-operator 的做法类似，也跟 Kubernetes 的做法有些异曲同工之妙，相当于是基于 Kubernetes 社区的实现做了一个新的抽象和改写。首先它需要设置 Main Entry：

```go
func TestMain(m *testing.M) {
    f.MainEntry(m)
}
```

这一函数会根据传入的诸如 Kubeconfig，ProjectRoot 等参数，创建出 CRD 和 Operator。Operator 可以运行在集群外，也可以以 Pod 的方式运行在集群内。

随后，集群就可以进行测试了。可以完全把它当做黑盒，把 Clientset 当做 kubectl，将端到端的黑盒测试自动化。不过这里值得一提的是，这一方式不能通过 `go test` 直接进行测试。因为在 `MainEntry` 中，会依赖一些参数，而这些参数会涉及一些预处理的逻辑。举个例子，Operator-SDK 会把 Operator 所有的 YAML 文件合并成一个 YAML，然后再把这一临时的 YAML 文件的路径作为参数传递给后续的命令。

因此在 Operator-SDK 中是利用 `operator-sdk test local` 这一命令先进行预处理，然后再把处理好的参数传递给 `go test` 命令的。这一方式对用户并不是那么友好，必须依赖 `operator-sdk` 才能发起测试。但它默认支持一个用例一个 Namespace，与 Kubernetes 测试时的行为类似。

### Kubebuilder-generated Operator 的做法

Kubebuilder 生成的测试，因为原本就依赖一个真实的 API Server 和 etcd，所以其实只要再创建出其他 Kubernetes 的组件，就可以了。但如果已经有在运行的 Kubernetes 集群，则可以利用 `UseExistingCluster` 来通过已经在运行的集群进行测试。

这样的方式相比于之前，可以真正地检查所有资源的状态。而在之前只有 API Server 的运行中，是做不到对状态的检查的，因为事件不会被 Kubernetes Controller Manager 处理，因此状态更新无法进行。

### tf-operator 的做法

因为端到端测试是黑盒测试，只要能够利用 Kubernetes 的 API 进行请求就可以完成，因此 [tf-operator][] 的端到端测试是用 Python 实现的。其实不只是端到端测试，tf-operator 的构建，也不是用 Make 或者 Bazel 做的，也是用 Python 实现的，他们都是[历史遗留问题](https://github.com/kubeflow/tf-operator/issues/739)。不过这也证明了，只要能够解决集群部署和 CRD 以及 Operator 的安装，用什么语言都可以做 Operator 的端到端测试。

## 总结

目前 Operator 的单元测试存在多种不同的实现方案。Kubernetes 和 [tf-operator][] 采取的方式能够细粒度地构造测试用例，同时检查 sync 的过程可否满足期望。etcd-operator 的方式为单元测试提供了一种新的思路，通过对 Operator 更高层次的抽象，针对高层次的抽象进行单元测试，可以避免手动利用 Indexer 构造测试场景的体力劳动。kubebuilder 生成的 Operator 实现的测试，并不是传统意义上的单元测试。它利用了真实的 API Server，在测试时可以利用 Client 获取真实的资源。但由于没有 Controller 的支持，所以对于不少需要依赖一些 Kubernetes 自身资源的状态来更新自己的状态的 CRD 而言，没办法进行状态的检查。这一问题在前面的方法中就不存在。

而对于端到端测试而言，基本所有的方案都是利用 Client 来对已经创建好的集群进行端到端的黑盒测试。而它们的区别主要体现在运行集群的方式。Kubernetes 和 Operator-SDK 的做法是利用 Framework 这一抽象，来部署集群环境。而 Operator-SDK 由于需要部署 CRD 和 Operator，因此基于 Kubernetes 原本的理念做了一些修改，支持从本地或者利用 Deployment 的方式部署 Operator 以便测试。而 kubebuilde 则是与其提供的单元测试采取了相似的方法，利用了 controller-runtime 提供的抽象和能力，在运行时注册 CRD，在测试代码中运行 Operator 的逻辑，依赖已经部署好的标准的 Kubernetes 集群进行端到端测试。但它默认情况下，没有每个测试使用一个 Namespace 的支持，需要用户自行实现这样的逻辑。

不同的测试选型适合于不同的 Operator，在测试时，可以根据 Operator 的特点来确定具体的测试方案。目前来看，并没有一个 One for all 的方案。

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.

[tf-operator]: https://github.com/kubeflow/tf-operator/
[etcd-operator]: https://github.com/coreos/etcd-operator/
