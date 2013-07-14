Nerve Net
==========

A framework help user to create namespace, event bus and dependency inject.

NerveNet（神经网）是一个JavaScript框架，帮助我们创造命名空间、生成事件总线、管理包、进行依赖注入，最终输出合并编译过的代码。

我给框架命名时从Backbone那里获得了灵感，因为使用Backbone时发现各种欠缺，在逐步修补它们时，这个框架渐渐成形了。我希望，一，它能弥补Backbone欠缺的地方；二，不要依赖Backbone，以便在更多场景中发挥作用。

## 原始JavaScript的问题

限于JavaScript自身的设计，在实际开发中我们会遭遇一些问题，项目越大就会越明显：

1. 为表单验证而生，代码碎片化是很自然的结果
2. 需要响应用户操作，借助事件侦听，进一步加剧碎片化
3. 半截子面向对象，很多现成的软件工程方法无法应用
4. 没有“块”的概念，容易污染全局变量
5. 不同浏览器之间有着不同的实现，存在兼容性问题

## jQuery和Backbone，以及各种最佳实践

时代在进步，技术在发展，前人不断努力，先后解决了很多问题。

最佳实践帮我们修补了本不完善的JavaScript语法，缩小了和标准面向对象语言之间的差距，使得相关的软件工程学方法得以应用。

jQuery（等框架）几乎消弭了浏览器之间的兼容性问题，甚至创造了全新的jQuery语法（很多语言统计里会把jQuery和JavaScript分开统计），可以让开发者更快，更直接的写代码。

但是这样写出的代码仍然零散，而且因为jQuery出身DOM，在操作数据方面没有什么作为。接着，顺应MVC大潮，Backbone出现了（其它框架暂且不论）。正如其作者所说，Backbone的目的就是帮助开发者更好的组织代码，成为代码的脊梁。

他干得的确很好，不过在开发中，仍然会遇到一些问题，比如：

1. 没有命名空间，不易管理代码。
2. 缺少包管理，不需要编译，难以管理依赖。
3. 如果项目较大，组件之间的关系和动作难以管理。

## AMD和CMD

无数仁人志士都在试图解决这些问题，我也一样。现在比较流行的规范有两种，AMD和CMD，分别以require.js和sea.js为代表。不过这两种解决方案我都不喜欢。

AMD要求代码必须写成

    require(['one', 'two', 'three'], function (one, two, three) {
   	  // do something with class
    });
    
CMD则要求代码必须写成

	define(function (require, exports) {
	  a = require('./a');
	  
	  a.doSomething();
	});
	
确实都不难理解，不过都要求我们按照规范重写代码，换句话说，加重了学习负担，增加了出错的几率。那么有何收获呢？也就那么回事儿，反正我在HTML里直接加引用也挺快的……再说最后的代码都要编译，平时怎么写没那么重要。于是，我就思考，什么样的写法是最自然，最合乎工程要求的。

这些思考的结果，凝结在一起，就是NerveNet。

## 从最佳实践延伸

    var MyClass = (function () {
	  var a = 1,
	      b = 2;
	  return function () {
	    // do something	
	  }
	}());

所谓立刻执行的匿名函数。这种做法的好处我就不罗嗦了，目前绝大多数代码都是这样封装的，大到框架小到单个类。接下来引入命名空间。

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

开源类库一般都会占用专属的命名空间，比如jQuery、Backbone等。我们可以在HTML里直接引用它们，

	<script src="libs/jquery-2.0.2.min.js"></script>
	<script src="libs/underscore-min.js"></script>
	<script src="libs/backbone-min.js"></script>
	<script src="js/class-base-on-jq.js"></script>

然后把其作为参数传进去（jQuery官方插件指南就推荐这么做）

    ;(function (ns, $, Backbone, _, window) {
    
    }(Nervenet.createNameSpace('com.meathill'), jQuery, Backbone, _, window));

这种做法非常的直观，是自然的JavaScript，没有引入新概念，阅读起来没有任何障碍——也不麻烦（我不喜欢require.js里针对引用的库写配置文件的做法，感觉多此一举）。同时，这样做对debug、使用Source Map必然没有任何影响。

## 其它面向对象语言的包管理

拿我做最久的ActionScript做例子

	import path.to.One;
	
	public function Two () {
	  var one = new One;
	}
	
IDE会检查代码，确保所有用到的类都已经被`import`进来，但在接下来的编译过程中，`import`会被移除，而后面的类则会被编译进最终的文件中。如此一来，在正式执行代码的时候，创建类实例的时候，所有依赖都已经被导入了。

这也是一个很自然的过程，各种面向对象语言证明了其简洁高效，IDE大多也支持“Ctrl+单击”跳转这样的功能（继续吐槽require.js的简写功能，让IDE怎么跳？）。

于是，在代码中加入

	"import com.meathill.SomeClass";
	
明显自然的多，而且，这种没有任何意义的“dead code”，在开发的时候，不会对其它代码产生影响；在编译时都会被干掉，不会污染到最终代码（只测试了UglifyJS）；至于IDE支持，也是现成的。

## 继续深入，模块之间的交互

*这里的模块指业务逻辑中的功能聚合的模块，拿有名的Yahoo首页举例，就是天气、股票等。*

说完了工程方面，再来看看代码架构。

模块之间最重要的是解耦，即模块A的存在和工作不依赖模块B的存在。所以我们可以建立一个事件总线，通过事件，调度各模块，进行需要的处理，完成解耦。

于是目标就变成：创建总线，将所有实例绑定在总线上。

    // main.js
    var context = NerveNet.createContext();
    var moduleA = new MyModuleA(),
        moduleB = new MyModuleB();
    context.injectInto(moduleA);
    context.mapEvent('SampleEvent', function (context) {
      moduleB.doSomething(); 
    });

    // MyModuleA.js
    // 广播总线事件
    function hellItsAboutTime () {
      this.context.trigger('SampleEvent');
    }
    setTimeout(hellItsAboutTime, 5000);

再举个常见的例子。通常我们会把和服务器交互的代码封装成一个类，并且采用单例模式。我们会在各处调用这个单例去服务器采集数据，当服务器返回错误的时候，就弹一个窗出来报错。

    // main.js
    var context = NerveNet.createContext();
    var module = new Module();
    context.injectInto(module);
    context.mapEvent('ServerError', function (context) {
      PopupManager.alert('Server error');
    });
    context.mapSingleton(Server, 'server');

    // Module.js
    var server = this.context.getInstance('server');
    server.save({
      id: 1,
      type: 'male',
      name: 'Jon Snow',
      isAlive: false
    });

这样，模块都只关心context，彼此之间不存在依赖关系，自然可以放心大胆去写。因为依赖均从context中获取，测试的时候也尽可以任意构造测试条件。

## 总结

我设计NerveNet框架时有以下断言：

1. 开发需要经历设计、编写、测试、编译、发布
2. 人写的代码是给人看的，发布的代码需要编译输出
3. 项目中绝大多数代码都是有用的，用户并不需要“按需加载”

而我的原则是：

1. 尽量不引入新概念、新语法、新结构，几乎不需要学习，之前的代码几乎不用修改就能继续使用
2. 建立在现有工作流程之上
3. 尽可能多的利用现有资源
4. 分别改进项目（包管理），和代码（总线，依赖注入）

## 灵感来源

在ActionScript平台上有个MVC框架叫Robotlegs，本框架的功能大多学自那里，并根据JavaScript的语言特性进行修改。