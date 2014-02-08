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

function isArray(obj) {
  if ('isArray' in Array) {
    return Array.isArray(obj);
  }
  return Object.prototype.toString.call(obj) === '[object Array]';
}
function isFunction(obj) {
  return toString.call(obj) === '[object Function]';
}
function isObject(obj) {
  return obj === Object(obj);
}
function isString(obj) {
  return toString.call(obj) === '[object String]';
}
function object(obj) {
  function F() {}
  F.prototype = obj;
  return new F();
}
function inherit(superClass, subClass) {
  var prototype = object(superClass.prototype);
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
function parseNamespace(str, root) {
  if (!str) {
    return false;
  }
  var arr = str.split('.'),
      root = root || global;
  for (var i = 0, len = arr.length; i < len; i++) {
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
  VERSION: '0.1.2',
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
  },
  inherit: inherit,
  parseNamespace: parseNamespace,
  setConfig: function (key, value) {
    if (key in config) {
      config[key] = value;
    }
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
 * Created by meathill on 14-2-7.
 */
var Mediator = function () {
  this.maps = {};
};
var defaults = {
  force: false,
  isSingleton: false
};

Mediator.errors = {
  EXIST: '[Error Nervenet.mediator.map] The selector already exists, you cannot map 2 classes for 1 selector.'
};

Mediator.prototype = {
  $context: null,
  isBackbone: false,
  check: function (container) {
    for (var selector in this.maps) {
      var nodes = container.querySelectorAll(selector)
        , vo = this.maps[selector];
      if (nodes.length > 0) {
        for (var i = 0, len = nodes.length; i < len; i++) {
          if (vo.isSingleton && vo.instance && 'setElement' in vo.instance) {
            vo.instance.setElement(nodes[i]);
            continue;
          }
          var mediator = this.createMediator(nodes[i], vo.klass, vo.options);
          if (vo.isSingleton) {
            vo.instance = mediator;
          } else {
            vo.instance = vo.instance || [];
            vo.instance.push(mediator);
          }
        }
      }
    }
  },
  createMediator: function (dom, className, options) {
    var param = this.isBackbone ? {el: dom} : dom
      , mediator = new className(param, options);
    if (this.$context) {
      this.$context.inject(mediator);
    }
    return mediator;
  },
  getVo: function (selector) {
    return this.map[selector];
  },
  hasMap: function (selector) {
    return !!this.maps[selector];
  },
  map: function (selector, className, options) {
    var vo = this.maps[selector];
    options = extend(defaults, options);
    if (vo && vo.klass !== className && !options.force) {
      throw new Error(Mediator.errors.EXIST);
    }
    this.maps[selector] = {
      klass: className,
      isSingleton: options.isSingleton,
      options: options
    };
    return this;
  },
  removeMap: function (selector) {
    this.maps[selector] = null;
  }
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
  this.mappings = {};
  this.eventMap = {};
  this.valueMap = {};
  this.config = extend({}, config);
  this.mediatorMap = new Mediator();

  this.mapValue('context', this);
  this.mapValue('mediatorMap', this.mediatorMap);
};
var MappingVO = function (klass, instance) {
  this.klass = klass;
  this.instance = instance;
};
Context.errors = {
  NOT_EXIST: '[Error Nervenet.context.getSingleton] the key doesn\'t exist',
  NOT_A_CLASS: '[Error Nervenet.context.mapClass] the second parameter is invalid, a class is expected',
  SOMETHING_EXIST: '[Error Nerver.context.mapClass/mapSingleton/mapValue] the mapping already exist'
};
Context.prototype = {
  createInstance: function (klass) {
    var args = slice.call(arguments, 1);
    for (var i = 0, len = args.length; i < len; i++) {
      if (isObject(args[i])) {
        this.inject(args[i]);
        continue;
      }
      if (isString(args[i])) {
        args[i] = this.getInjectValue(args[i]);
      }
    }
    klass = isString(klass) ? this.getClass(klass) : klass;
    var instance = 'create' in Object ? Object.create(klass.prototype) : object(klass.prototype);
    klass.apply(instance, args);
    this.inject(instance);
    return instance;
  },
  getClass: function (key) {
    return this.mappings[key].klass;
  },
  getInjectValue: function (key, value) {
    var prefix = this.config.injectPrefix === '$' ? '\\$' : this.config.injectPrefix,
        preReg = new RegExp('^' + prefix + '([\\w\\-]+)$'),
        valueReg = new RegExp('^{{' + prefix + '([\\w\\-]+)}}$');

    // get specific value first
    if (isString(value) && value.length > 0) {
      if (valueReg.test(value)) {
        var mapKey = value.match(valueReg)[1];
        return this.getValue(mapKey) || (mapKey in this.mappings && this.getSingleton(mapKey));
      }

      var klass = parseNamespace(value);
      if (klass) { // has specific type
        if (isFunction(klass)) { // need (to create) instance
          var isExist = false;
          for (var mapKey in this.mappings) {
            if (this.getClass(mapKey) === klass) {
              if (this.getSingleton(mapKey)) {
                return this.getSingleton(mapKey);
              } else {
                var instance = this.createInstance(mapKey);
                this.mapSingleton(mapKey, instance);
                return instance;
              }
              isExist = true;
              break;
            }
          }
          if (!isExist) {
            var instance = this.createInstance(klass);
            this.mapSingleton(value, klass, instance);
            return instance;
          }
        } else {
          this.mapValue(value, klass);
          return klass;
        }
      }
    }

    // then search in key
    if (preReg.test(key)) {
      var key = key.match(preReg)[1];
      if (key in this.valueMap) {
        return this.getValue(key);
      } else if (key in this.mappings) {
        return this.getSingleton(key);
      }
    }

    return value || key;
  },
  getSingleton: function (key) {
    if (!(key in this.mappings)) {
      throw new Error(Context.errors.NOT_EXIST);
    }
    if (!this.mappings[key].instance) {
      var args = slice.call(arguments, 1);
      args.unshift(key);
      this.mappings[key].instance = this.createInstance.apply(this, args);
    }
    return this.mappings[key].instance;
  },
  getValue: function (key) {
    return this.valueMap[key];
  },
  hasMapping: function (key) {
    return key in this.mappings;
  },
  hasValue: function (key) {
    return key in this.valueMap;
  },
  inject: function (target) {
    for (var key in target) {
      target[key] = this.getInjectValue(key, target[key]);
    }
    if (target.postConstruct && isFunction(target.postConstruct)) {
      var args = slice.call(arguments, 1);
      target.postConstruct.apply(target, args);
    }
    return this;
  },
  mapClass: function (key, constructor) {
    if (!isFunction(constructor)) {
      throw new Error(Context.errors.NOT_A_CLASS);
    }
    if (this.hasMapping(key)) {
      throw new Error(Context.errors.SOMETHING_EXIST);
    }
    this.mappings[key] = new MappingVO(constructor);
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
    if (this.hasMapping(alias)) {
      throw new Error(Context.errors.SOMETHING_EXIST);
    }
    if (instance) {
      if (instance instanceof constructor) {
        this.mappings[alias] = new MappingVO(constructor, instance);
      } else {
        var args = slice.call(arguments, 1);
        instance = this.createInstance.apply(this, args);
        this.mappings[alias] = new MappingVO(constructor, instance);
      }
      return this;
    }
    if (isFunction(constructor)) {
      this.mappings[alias] = new MappingVO(constructor);
    } else {
      this.mappings[alias] = new MappingVO(null, constructor);
    }
    return this;
  },
  mapValue: function (key, value) {
    if (this.hasValue(key)) {
      throw new Error(Context.errors.SOMETHING_EXIST);
    }
    this.valueMap[key] = value;
    return this;
  },
  removeMapping: function (key) {
    this.mappings[key] = null;
    delete this.mappings[key];
  },
  removeValue: function (key) {
    this.valueMap[key] = null;
    delete this.valueMap[key];
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
    index = 0,
    queue = [],
    ordered = [],
    startup = {},
    head = document.getElementsByTagName('head')[0] || document.documentElement,
    baseElement = head.getElementsByTagName('base')[0],
    xhr = new XMLHttpRequest();

xhr.onload = function () {
  queue[index].content = this.response;
  Packager.parse(this.response);
  index++;
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
      for (var j = 0, qlen = queue.length; j < qlen; j++) {
        if (queue[j].fullname === ordered[i]) {
          createScript(queue[j].content, queue[j].className);
          queue.splice(j, 1);
          break;
        }
      }
    }

    if ('func' in startup) {
      startup.func.call(startup.context);
    }
  },
  loadNext: function () {
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
                offset = ordered.indexOf(sub);
            ordered.splice(offset, 0, fullname);
          }
        }
      }
    }
  },
  reset: function () {
    index = 0;
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