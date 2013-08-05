/**
 * Nerve Net Library
 * https://github.com/meathill/nervenet
 *
 * Copyright 2013 All contributors
 * Released under the MIT license
 */
(function (global) {
  if (global.Nervenet) {
    return;
  }
/**
 * Created with JetBrains WebStorm.
 * Date: 13-5-25
 * Time: 下午12:41
 * @overview a group of functions
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1
 */

var slice = Array.prototype.slice,
    toString = Object.prototype.toString;

function isFunction(obj) {
  return toString.call(obj) === '[object Function]';
}
function isString(obj) {
  return toString.call(obj) === '[object String]';
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
function extend(obj) {
  var args = slice.call(arguments, 1);
  for (var i = 0, len = args.length; i < len; i++) {
    var source = args[i];
    for (var prop in source) {
      obj[prop] = source[prop];
    }
  }
  return obj;
}
function parseNamespace(str) {
  if (!str) {
    return false;
  }
  var arr = str.split('.'),
      root = global[arr[0]];
  for (var i = 1, len = arr.length; i < len; i++) {
    if (!(arr[i] in root)) {
      return false;
    }
    root = root[arr[i]];
  }
  return root;
}
/**
 * Created with JetBrains WebStorm.
 * Date: 13-7-15
 * Time: 下午9:55
 * @overview the NerveNet object
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since Nervenet对象
 */

var namespaces = {};
var Nervenet = global.Nervenet = {
  VERSION: '0.1.0',
  createContext: function () {
    return new Context();
  },
  createNameSpace: function (ns, root) {
    var arr = ns.split('.'),
        root = root || global;

    // note first level namespace here
    namespaces[ns] = root;

    for (var i = 0, len = arr.length; i < len; i++) {
      root[arr[i]] = root[arr[i]] || {};
      root = root[arr[i]];
    }
    return root;
  }
};
/**
 * Created with JetBrains WebStorm.
 * Date: 13-7-15
 * Time: 下午10:17
 * @overview the configuration of Nervenet
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1
 */
var config = {
  dir: 'js',
  injectPrefix: '$'
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
  this.voMap = {};
  this.config = extend({}, config);
};
var Errors = {
  NOT_A_CLASS: '[Error Nervenet.context.mapClass] the second parameter is invalid, a class is expected',
  SOMETHING_EXIST: '[Error Nerver.context.mapClass/mapSingleton/mapValue] the mapping already exist'
};
Context.prototype = {
  createInstance: function (constructor) {
    var args = slice.call(arguments, 1);
    constructor = isString(constructor) ? this.getClass(constructor) : constructor;
    var instance = new constructor(args);
    this.inject(instance);
    return instance;
  },
  getClass: function (key) {
    return this.constructors[key];
  },
  getSingleton: function (alias) {
    if (!(alias in this.singletons)) {
      if (!(alias in this.constructors)) {
        throw new Error('no such class');
      }
      this.singletons[alias] = this.createInstance(alias);
    }
    return this.singletons[alias];
  },
  getValue: function (key) {
    return this.voMap[key];
  },
  hasClass: function (key) {
    return key in this.constructors;
  },
  hasSingleton: function (key) {
    return key in this.singletons;
  },
  hasValue: function (key) {
    return key in this.voMap;
  },
  inject: function (target) {
    for (var name in target) {
      // only inject props with prefix
      if (!isString(target[name]) || name.indexOf(this.config.injectPrefix) !== 0) {
        continue;
      }
      var key = name.substr(this.config.injectPrefix.length),
          value = target[name],
          type = parseNamespace(value);
      if (type) { // has specific type
        if (isFunction(type)) { // need (to create) instance
          // check if exist
          var isExist = false;
          for (var constructor in this.constructors) {
            if (this.getClass(constructor) === type) {
              if (this.hasSingleton(constructor)) {
                target[name] = this.getSingleton(constructor);
              } else {
                target[name] = this.createInstance(constructor);
                this.mapSingleton(constructor, target[name]);
              }
              isExist = true;
              break;
            }
          }
          if (!isExist) {
            target[name] = this.createInstance(type);
            this.mapSingleton(value, type, target[name]);
            continue;
          }
        } else {
          this.mapValue(value, type);
          target[name] = type;
          continue;
        }
      }
      if (this.voMap.hasOwnProperty(key)) {
        target[name] = this.getValue(key);
        continue;
      }
      if (this.singletons.hasOwnProperty(key)) {
        target[name] = this.getSingleton(key);
        continue;
      }
    }
    if (target.postConstruct && isFunction(target.postConstruct)) {
      target.postConstruct();
    }
    return this;
  },
  mapClass: function (key, constructor) {
    if (!isFunction(constructor)) {
      throw new Error(Errors.NOT_A_CLASS);
    }
    if (this.hasClass(key)) {
      throw new Error(Errors.SOMETHING_EXIST);
    }
    this.constructors[key] = constructor;
    return this;
  },
  mapEvent: function (event, command, context) {
    this.eventMap[event] = this.eventMap.event || [];
    this.eventMap[event].push({
      command: command,
      context: context
    });
  },
  mapSingleton: function (alias, constructor, instance) {
    if (this.hasSingleton(alias)) {
      throw new Error(Errors.SOMETHING_EXIST);
    }
    if (instance) {
      this.constructors[alias] = constructor;
      this.singletons[alias] = instance;
    }
    if (isFunction(constructor)) {
      this.constructors[alias] = constructor;
    } else {
      this.singletons[alias] = constructor;
    }
    return this;
  },
  mapValue: function (key, value) {
    if (this.hasValue(key)) {
      throw new Error(Errors.SOMETHING_EXIST);
    }
    this.voMap[key] = value;
    return this;
  },
  removeClass: function (key) {
    this.constructors[key] = null;
    delete this.constructors[key];
  },
  removeValue: function (key) {
    this.voMap[key] = null;
    delete this.voMap[key];
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

}(this));