/**
 * Nerve Net Library
 * https://github.com/meathill/nervenet
 *
 * Copyright 2013 All contributors
 * Released under the MIT license
 */
(function () {
  // save a reference to the global object
  var root = this;
  var Nervenet;
  if (typeof exports !== 'undefined') {
    Nervenet = exports;
  } else {
    Nervenet = root.Nervenet = {};
  }

  Nervenet.VERSION = '0.1.0';
  Nervenet.createContext = function () {
    return new Context();
  };
/**
 * Created with JetBrains WebStorm.
 * Date: 13-5-25
 * Time: 下午12:34
 * @overview Build a context, let everything happen in this sandbox
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1
 */
'use strict';
var namespaces = {},
    Context = function () {
      this.injector = new Injector();
    };
Context.createNameSpace = function (ns, root) {
  var arr = ns.split('.'),
      root = root || window;

  // note first level namespace here
  namespaces[ns] = root;

  for (var i = 0, len = arr.length; i < len; i++) {
    root[arr[i]] = root[arr[i]] || {};
    root = root[arr[i]];
  }
  return root;
};
Context.prototype = {
  injector: null,
  config: function (func) {
    func.call(this);
    return this;
  },
  initInjector: function (exclusive) {
    exclusive = isArray(exclusive) ? exclusive : [exclusive];
    for (var prop in namespaces) {
      for (var i = 0, len = exclusive.length; i < len; i++) {
        var reg = new RegExp('^' + exclusive[i]);
        if (!reg.test(prop)) {
          var arr = prop.split('.'),
              node = namespaces[prop];
          for (var j = 0, depth = arr.length; j < depth; j++) {
            node = node[arr[j]];
          }
          for (var className in node) {
            if (isFunction(node[className])) {
              node[className].prototype.app = this;
            }
          }
        }
      }
    }
  },
  inject: function (constructor) {
    constructor.prototype.app = this;
  }
}
/**
 * Created with JetBrains WebStorm.
 * Date: 13-5-25
 * Time: 下午2:03
 * @overview inject dependencies
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1
 */
'use strict';
var Injector = function () {
  this.singletons = {};
  this.constructors = {};
  this.eventMap = [];
}
Injector.prototype = {
  constructors: null,
  singletons: null,
  eventMap: null,
  getSingleton: function (className) {
    if (!this.singletons[className]) {
      if (!(className in this.constructors)) {
        throw new Error('no such class');
      }
      this.singletons[className] = new this.constructors[className]();
    }
    return this.singletons[className];
  },
  mapEvent: function (type, command, context) {
    this.eventMap.push({
      type: type,
      command: command,
      context: context
    });
  },
  mapSingleton: function (className, value) {
    if (isFunction(value)) {
      this.constructors[className] = value;
    } else {
      this.singletons[className] = value;
    }
  },
  trigger: function (eventType) {
    var args = Array.prototype.slice.call(arguments, 1);
    args.push(this);
    for (var i = 0, len = this.eventMap.length; i < len; i++) {
      var eventObj = this.eventMap[i];
      if (eventObj.type === eventType) {
        eventObj.command.apply(eventObj.context, args);
      }
    }
  }
}
/**
 * Created with JetBrains WebStorm.
 * Date: 13-5-25
 * Time: 下午12:41
 * @overview a group of functions
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1
 */
function isFunction(obj) {
  return typeof obj == 'function';
}
function isArray(obj) {
  if ('isArray' in Array) {
    return Array.isArray(obj);
  }
  return Object.prototype.toString.call(obj) === '[object Array]';
}

}());