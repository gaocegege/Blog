---
layout: post
title: "Kubebuilder 新版本 Scaffolding 之我见"
description: 
headline:
modified: 2019-05-29
category: Kubernetes
tags: [Kubernetes]
imagefeature:
mathjax: false
chart:
comments: true
featured: true
---

[kubebuilder][] 是一个用来帮助用户快速实现 Kubernetes CRD Operator 的 SDK，由于其易用性，在 Kubernetes 社区中被广泛地使用。在其第一版设计中，由于生成的模板代码扩展性不佳的问题，导致了一些用户的[抱怨](https://github.com/kubernetes-sigs/kubebuilder/issues/611)，于是维护者推出了 Scaffolding 的[第二版实现](https://github.com/kubernetes-sigs/kubebuilder/blob/master/designs/simplified-scaffolding.md)。

有关 Kubernetes CRD，[kubebuilder][] 第一版 Scaffolding 的使用，以及 Scaffolding 代码背后的实现逻辑，请看前文[利用 kubebuilder 优化 Kubernetes Operator 开发体验](http://gaocegege.com/Blog/kubebuilder)。本文主要介绍 [kubebuilder][] Scaffolding 的新实现带来的开发体验的变化，以及对这一新实现的个人看法。

首先来看看新的 Scaffolding 实现的目录结构：

```
.
├── api
│   └── v1beta1
│       ├── frigate_types.go
│       ├── frigate_types_test.go
│       ├── groupversion_info.go
│       ├── suite_test.go
│       └── zz_generated.deepcopy.go
├── bin
│   └── manager
├── config
│   ├── certmanager
│   │   ├── certificate.yaml
│   │   ├── kustomization.yaml
│   │   └── kustomizeconfig.yaml
│   ├── crd
│   │   ├── kustomization.yaml
│   │   ├── kustomizeconfig.yaml
│   │   └── patches
│   │       └── webhook_in_frigate.yaml
│   ├── default
│   │   ├── kustomization.yaml
│   │   ├── manager_auth_proxy_patch.yaml
│   │   ├── manager_image_patch.yaml
│   │   ├── manager_prometheus_metrics_patch.yaml
│   │   ├── manager_webhook_patch.yaml
│   │   └── webhookcainjection_patch.yaml
│   ├── manager
│   │   ├── kustomization.yaml
│   │   └── manager.yaml
│   ├── rbac
│   │   ├── auth_proxy_role_binding.yaml
│   │   ├── auth_proxy_role.yaml
│   │   ├── auth_proxy_service.yaml
│   │   ├── kustomization.yaml
│   │   └── role_binding.yaml
│   ├── samples
│   │   └── ship_v1beta1_frigate.yaml
│   └── webhook
│       ├── kustomization.yaml
│       ├── kustomizeconfig.yaml
│       └── service.yaml
├── controllers
│   ├── frigate_controller.go
│   └── suite_test.go
├── Dockerfile
├── go.mod
├── hack
│   └── boilerplate.go.txt
├── main.go
├── Makefile
└── PROJECT
```

v1 Scaffolding 的实现，与没有使用 [kubebuilder][] 实现的 Controller 具有类似的目录结构。而 v2 Scaffolding 的实现，则是对其进行了简化。

不过其变化最大的地方，还是在 controller 自身的实现逻辑中。首先来看看新版的 manager 是怎样的：

```go
var (
	scheme   = runtime.NewScheme()
	setupLog = ctrl.Log.WithName("setup")
)

func init() {

	shipv1beta1.AddToScheme(scheme)
	// +kubebuilder:scaffold:scheme
}

func main() {
	var metricsAddr string
	flag.StringVar(&metricsAddr, "metrics-addr", ":8080", "The address the metric endpoint binds to.")
	flag.Parse()

	ctrl.SetLogger(zap.Logger(true))

	mgr, err := ctrl.NewManager(ctrl.GetConfigOrDie(), ctrl.Options{Scheme: scheme, MetricsBindAddress: metricsAddr})
	if err != nil {
		setupLog.Error(err, "unable to start manager")
		os.Exit(1)
	}

	err = (&controllers.FrigateReconciler{
		Client: mgr.GetClient(),
		Log:    ctrl.Log.WithName("controllers").WithName("Frigate"),
	}).SetupWithManager(mgr)
	if err != nil {
		setupLog.Error(err, "unable to create controller", "controller", "Frigate")
		os.Exit(1)
	}
	// +kubebuilder:scaffold:builder

	setupLog.Info("starting manager")
	if err := mgr.Start(ctrl.SetupSignalHandler()); err != nil {
		setupLog.Error(err, "problem running manager")
		os.Exit(1)
	}
}
```

在之前的实现中，controller 的创建是被放在 controller 自己的包中进行的，这就导致了，来自 CLI 的命令行参数很难被传递到 controller 中，控制 controller 的逻辑。同时也使得第一版的实现对不太熟悉 Kubernetes 内置的 controller（如 deployment controller 等）实现的开发者很难立刻入手，因为第一版的实现的目录结构是遵循了 Kubernetes 社区的一些惯例的。为了解决这些问题，第二版的实现利用了 [Builder 模式][2]简化了整个的过程。

在 Manager 的创建中，`ctrl.NewManager` 与第一版实现作用相同，都是创建了一个新的 Manager 实例。第二版的 Scheme 是事先被创建好，然后被传递进 Manager 中的。而在第一版中，是首先创建出 Manager 实例，然后再将 CR 添加到 Scheme 中的。不过这并无本质不同，在第二版中，将 CR 添加到 Scheme 中这一操作是在 main 包中进行的，这使得逻辑更加清晰。

接下来可以看到，controller 的创建被放在了 main 包中进行，这使得之前提到的问题都可以被避免，命令行参数可以被直接传递到 controller 中。而其后的 `SetupWithManager` 则是利用 [Builder 模式][2]创建出了完整的 controller 的实例。

接下来我们继续往下走，看下 controller 是如何真正被创建的。

```go
// FrigateReconciler reconciles a Frigate object
type FrigateReconciler struct {
	client.Client
	Log logr.Logger
}

// +kubebuilder:rbac:groups=ship.example.com,resources=frigates,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=ship.example.com,resources=frigates/status,verbs=get;update;patch
func (r *FrigateReconciler) Reconcile(req ctrl.Request) (ctrl.Result, error) {
	_ = context.Background()
	_ = r.Log.WithValues("frigate", req.NamespacedName)

	// your logic here

	return ctrl.Result{}, nil
}

func (r *FrigateReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&shipv1beta1.Frigate{}).
		Complete(r)
}
```

`SetupWithManager` 是利用了 [controller-runtime][] 中实现的 Controller Builder，构建了完整的 Controller 实例。

```go
// Builder builds a Controller.
type Builder struct {
	apiType        runtime.Object
	mgr            manager.Manager
	predicates     []predicate.Predicate
	managedObjects []runtime.Object
	watchRequest   []watchRequest
	config         *rest.Config
	ctrl           controller.Controller
}
// SimpleController returns a new Builder.
func SimpleController() *Builder {
	return &Builder{}
}
// ControllerManagedBy returns a new controller builder that will be started by the provided Manager
func ControllerManagedBy(m manager.Manager) *Builder {
	return SimpleController().WithManager(m)
}
// WithManager sets the Manager to use for registering the ControllerManagedBy.  Defaults to a new manager.Manager.
func (blder *Builder) WithManager(m manager.Manager) *Builder {
	blder.mgr = m
	return blder
}
// For defines the type of Object being *reconciled*, and configures the ControllerManagedBy to respond to create / delete /
// update events by *reconciling the object*.
// This is the equivalent of calling
// Watches(&source.Kind{Type: apiType}, &handler.EnqueueRequestForObject{})
// If the passed in object has implemented the admission.Defaulter interface, a MutatingWebhook will be wired for this type.
// If the passed in object has implemented the admission.Validator interface, a ValidatingWebhook will be wired for this type.
func (blder *Builder) For(apiType runtime.Object) *Builder {
	blder.apiType = apiType
	return blder
}
```

`ControllerManagedBy` 返回了一个被设置好 Manager 的 Builder。随后的 `For` 是给 Builder 设置了要 watch 的资源类型。

```go
// Complete builds the Application ControllerManagedBy.
func (blder *Builder) Complete(r reconcile.Reconciler) error {
	_, err := blder.Build(r)
	return err
}
// Build builds the Application ControllerManagedBy and returns the Manager used to start it.
func (blder *Builder) Build(r reconcile.Reconciler) (manager.Manager, error) {
	if r == nil {
		return nil, fmt.Errorf("must provide a non-nil Reconciler")
	}
	// Set the Config
	if err := blder.doConfig(); err != nil {
		return nil, err
	}
	// Set the Manager
	if err := blder.doManager(); err != nil {
		return nil, err
	}
	// Set the ControllerManagedBy
	if err := blder.doController(r); err != nil {
		return nil, err
	}
	// Set the Webook if needed
	if err := blder.doWebhook(); err != nil {
		return nil, err
	}
	// Set the Watch
	if err := blder.doWatch(); err != nil {
		return nil, err
	}
	return blder.mgr, nil
}
```

最后，Builder 会将 Controller 构建成完整的实例，并且加入到 Manager 下，这一过程与第一版实现并无二致。

整体来看，第二版 Scaffolding 的实现无疑大大提高了易用性，与第一版相比，功能相同但具有更高的扩展性。其最大的变动，是利用了 Builder 模式，让整个构建过程变得更加灵活。用户可以根据自己的需要来在 Builder 中加入对应的构建过程。

## 关于作者

[高策](http://gaocegege.com)，[才云科技](https://caicloud.io) AI 平台组工程师。如有问题，敬请斧正。

## License

- This article is licensed under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).
- Please contact me for commercial use.

[kubebuilder]: https://github.com/kubernetes-sigs/kubebuilder/
[1]: https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/
[controller-runtime]: https://github.com/kubernetes-sigs/controller-runtime
[2]: https://en.wikipedia.org/wiki/Builder_pattern
