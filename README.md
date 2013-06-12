Nerve Net
==========

A framework help user to create namespace, event bus and dependency inject.

NerveNet（神经网）是一个JavaScript框架，帮助我们创造命名空间、生成事件总线，并进行依赖注入。未来它还会管理依赖，处理编译输出。

我命名时是从Backbone那里获取的灵感，因为使用Backbone时发现有些欠缺。我希望，一，它能弥补Backbone欠缺的地方；二，它并不依赖Backbone，可以作用在更多场景中。

## 原始JavaScript的问题

限于JavaScript自身的设计，在实际开发中我们会遭遇一些问题，项目越大就会越明显：

1. 没有命名空间，不易管理代码。
2. 缺少包管理，不需要编译，难以管理依赖。
3. 如果项目较大，我们需要某种工具来调控组件之间的动作
4. 在实际开发中，我们还希望能对单例进行自动化管理

## 常见破法：立刻执行的匿名函数

    var MyClass = (function () {
	  var a = 1,
	      b = 2;
	  return function () {
	    // do something	
	  }
	}());

通过这种方式，可以利用JavaScript的闭包特性，避免污染全局环境。再走远一点，我们可以将命名空间引入进来。

	var com = {'meathill': {}};
	com.meathill.MyClass = (function () {
	  ....
	}

这种全手写的做法不算太好，一来比较麻烦，二来我们都知道JavaScript的链式查找效率不算太高。所以这里我们可以用一个函数替代它，创建命名空间，并作为参数传递进去。

	;(function (ns) {
      // 这里放局部变量
	  ns.MyClass = function () {
        ....
      }
	}(Nervenet.createNameSpace('com.meathill')));

### 开源类库

开源类库一般都会占用专属的命名空间，比如jQuery、Backbone等。我们可以把它们也作为参数传进去（jQuery官方就推荐这么做）

    ;(function (ns, $, Backbone, _, window) {
    
    }(Nervenet.createNameSpace('com.meathill'), jQuery, Backbone, _, window));

这种做法非常的直观，并没有引入新概念，阅读起来没有任何障碍。这也是我在创建这个框架时的指导思想之一：尽量不引入新概念。

## 继续深入，模块之间的交互

模块之间最重要的是解耦，即模块A的存在和工作不依赖模块B的存在（当然实际开发中我们可能很难做到，不过作为努力的方向总没有错）。所以我们可以选择通过统一的事件总线，调度和处理事件，完成解耦。

于是目标就变成：创建总线，将所有实例绑定在总线上。

    var context = NerveNet.createContext();
    var modulea = new MyModuleA(),
        moduleb = new MyModuleB();
    context.injectInto(modulea);
    context.mapEvent('SampleEvent', function (context) {
      moduleb.doSomething(); 
    });

    // 在modulea里出发总线事件
    modulea.context.trigger('SampleEvent');

这里解耦还不是很干脆，不过没关系，小小的改造一下即可

    var context = NerveNet.createContext();
    var modulea = new MyModuleA();
    context.injectInto(modulea);
    context.mapEvent('SampleEvent', function (context) {
      var moduleb = context.getInstance('moduleb');
      moduleb.doSomething(); 
    });
    context.map(MyModuleB, 'moduleb');

    // 在modulea里出发总线事件
    modulea.context.trigger('SampleEvent');

这样，模块A和模块B之间就不存在依赖关系，可以分别编写和测试。

有些时候我们限定某些模块必须是单例，同时我们知道，JavaScript里是没有静态函数的（可以模拟），不过没关系，把单例限定放在context里就行了：

    context.mapSingleton(MyModuleB, 'moduleb');

如此一来，只要放在同一个事件总线，即环境（context）中，那么不同模块之间就可以通过总线事件进行交互。这样，我们基本完成了模块间的解耦。

## 依赖注入

同样为了便于测试和发布，我们还会用到依赖注入这种手段（这里不解释什么是依赖注入，只是说明做法）。坦白说，目前要在JavaScript里实现依赖注入还是有点困难的，不过我们总有曲线救国的方法能用。（附：[Angular的实现方式](http://dailyjs.com/2013/05/23/angularjs-injection/ "AngularJS: More on Dependency Injection")）



## 依赖管理

## 灵感来源

在ActionScript平台上有个MVC框架叫Robotlegs。本类库的功能基本都移植自Robotlegs，并根据JavaScript的语言特性进行修改。