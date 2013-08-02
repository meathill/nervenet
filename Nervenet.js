/**
 * Created with JetBrains WebStorm.
 * Date: 13-7-15
 * Time: 下午9:55
 * @overview the NerveNet object
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since Nervenet对象
 */

var namespaces = {};
// save a reference to the global object
exports.VERSION = '0.1.0';
exports.createContext = function () {
  return new Context();
};
exports.createNameSpace = function (ns, root) {
  var arr = ns.split('.'),
      root = root || global;

  // note first level namespace here
  namespaces[ns] = root;

  for (var i = 0, len = arr.length; i < len; i++) {
    root[arr[i]] = root[arr[i]] || {};
    root = root[arr[i]];
  }
  return root;
};
/**
 * Created with JetBrains WebStorm.
 * Date: 13-7-15
 * Time: 下午10:17
 * @overview the configuration of Nervenet
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1
 */
var config = exports.config = {
  context: 'app',
  dir: 'js',
  isAjax: true
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
var Context = function () {
  this.singletons = {};
  this.constructors = {};
  this.eventMap = {};
  this.kvMap = {};
};
Context.prototype = {
  createInstance: function (constructor) {
    var args = slice.call(arguments, 1),
        instance = new constructor(args);
    instance[config.context] = this;
    return instance;
  },
  getSingleton: function (alias) {
    if (!(alias in this.singletons)) {
      if (!(alias in this.constructors)) {
        throw new Error('no such class');
      }
      this.singletons[alias] = new this.constructors[alias]();
    }
    return this.singletons[alias];
  },
  getValue: function (key) {
    return this.kvMap[key];
  },
  init: function (exclusive) {
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
              node[className].prototype[config.context] = this;
            }
          }
        }
      }
    }
  },
  injectInto: function (constructor) {
    if (isFunction(constructor)) {
      constructor.prototype[config.context] = this;
    } else {
      constructor[config.context] = this;
    }
  },
  mapEvent: function (event, command, context) {
    this.eventMap[event] = this.eventMap.event || [];
    this.eventMap[event].push({
      command: command,
      context: context
    });
  },
  mapSingleton: function (className, alias) {
    if (isFunction(className)) {
      this.constructors[alias] = className;
    } else {
      this.singletons[alias] = className;
    }
  },
  mapValue: function (key, value) {
    this.kvMap[key] = value;
  },
  start: function (callback) {
    Packager.start(callback, this);
  },
  trigger: function (event) {
    var args = Array.prototype.slice.call(arguments, 1),
        handlers = this.eventMap[event];
    args.push(this);
    for (var i = 0, len = handlers.length; i < len; i++) {
      var eventObj = handlers[i];
      eventObj.command.apply(eventObj.context, args);
    }
  }
};
/**
 * Created with JetBrains WebStorm.
 * Date: 13-7-15
 * Time: 下午11:26
 * @overview handle class dependency and create load queue
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1
 */
var REG = /(import|extend) ((\w+\.)+(\w+))/ig,
    index = -1,
    queue = [],
    ordered = [],
    startup = {},
    head = document.getElementsByTagName('head')[0] || document.documentElement,
    baseElement = head.getElementsByTagName('base')[0],
    xhr = new XMLHttpRequest();

xhr.onload = function () {
  queue[index].content = this.response;
  Packager.parse(this.response);
  Packager.loadNext();
}
function getPath(str) {
  return config.dir + '/' + str.split('.').join('/') + '.js';
}
function createScript(str, className) {
  className = className || '';
  var script = document.createElement('script');
  script.className = 'nervenet ' + className;
  script.innerHTML = str;
  if (baseElement) {
    head.insertBefore(script, baseElement);
  } else {
    head.appendChild(script);
  }
}

var Packager = {
  createNodes: function () {
    for (var i = 0, len = ordered.length; i < len; i++) {
      for (var j = 0; j < len; j++) {
        if (queue[j].fullname === ordered[i]) {
          break;
        }
      }
      createScript(queue[j].content, queue[j].className);
      queue.splice(j, 1);
    }

    if ('func' in startup) {
      startup.func.call(startup.context);
    }
  },
  loadNext: function () {
    index++;
    if (index >= queue.length) {
      this.createNodes();
      return;
    }

    xhr.open('get', getPath(queue[index].fullname));
    xhr.send();
  },
  parse: function (str) {
    if (isFunction(str)) {
      str = str.toString();
    }
    var classes = str.match(REG);
    if (classes) {
      for (var i = 0, len = classes.length; i < len; i++) {
        var fullname = classes[i].slice(7);
        if (ordered.indexOf(fullname) === -1) {
          var item = {
            fullname: fullname,
            className: fullname.slice(fullname.lastIndexOf('.') + 1),
            type: classes[i].substr(0, 6),
            content: ''
          };
          queue.push(item);
          if (item.type === 'import') {
            ordered.push(fullname);
          } else {
            var sub = queue[index].fullname,
                j = 0;
            while (ordered[j] !== sub) {
              j++;
            }
            ordered.splice(j, 0, fullname);
          }
        }
      }
    }
  },
  reset: function () {
    ordered = [];
    queue = [];
  },
  start: function (callback, context) {
    this.reset();
    startup = {
      func: callback,
      context: context
    };

    this.parse(callback);
    this.loadNext();
  }
};
/**
 * Created with JetBrains WebStorm.
 * Date: 13-5-25
 * Time: 下午12:41
 * @overview a group of functions
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1
 */

var slice = Array.prototype.slice;

function isFunction(obj) {
  return typeof obj == 'function';
}
function isArray(obj) {
  if ('isArray' in Array) {
    return Array.isArray(obj);
  }
  return Object.prototype.toString.call(obj) === '[object Array]';
}
function inherit(superClass, subClass) {
  var prototype = Object(superClass.prototype);
  prototype.constructor = subClass;
  subClass.prototype = prototype;
}