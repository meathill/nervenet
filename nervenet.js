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

var slice = Array.prototype.slice
  , toString = Object.prototype.toString
  , OBJECT_ARRAY = '[object Array]'
  , OBJECT_FUNCTION = '[object Function]'
  , OBJECT_OBJECT = '[object Object]'
  , OBJECT_STRING = '[object String]';

function isArray(obj) {
  if ('isArray' in Array) {
    return Array.isArray(obj);
  }
  return Object.prototype.toString.call(obj) === OBJECT_ARRAY;
}
function isFunction(obj) {
  return toString.call(obj) === OBJECT_FUNCTION;
}
function isObject(obj) {
  return obj === Object(obj) && toString.call(obj) === OBJECT_OBJECT;
}
function isString(obj) {
  return toString.call(obj) === OBJECT_STRING;
}
function isDom(obj) {
  return typeof HTMLElement === 'object' ? obj instanceof HTMLElement :
    obj && typeof obj === 'object' && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === 'string';
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
  obj = obj || {};
  var args = slice.call(arguments, 1);
  for (var i = 0, len = args.length; i < len; i++) {
    var source = args[i];
    if (!source) {
      continue;
    }
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
    if (!(arr[i] in root) || isDom(root[arr[i]])) {
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
  VERSION: '0.1.9',
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
  force: false, // 是否强制替换map的类
  isSingle: false // 是否使用一个mediator管理所有节点
};

Mediator.errors = {
  EXIST: '[Error Nervenet.mediator.map] The selector already exists, you cannot map 2 classes for 1 selector.'
};

Mediator.prototype = {
  $context: null,
  isBackbone: false,
  check: function (container, extra) {
    var matches = container.matches
      || container.matchesSelector
      || container.webkitMatchesSelector
      || container.mozMatchesSelector
      || container.msMatchesSelector;
    for (var selector in this.maps) {
      // 先查自己
      if (matches && matches.call(container, selector)) {
        this.preCheck(container, selector, extra);
      }

      // 再查子节点
      var nodes = container.querySelectorAll(selector);
      if (nodes.length === 0) {
        continue;
      }
      this.preCheck(nodes, selector, extra);
    }
  },
  preCheck: function (nodes, selector, extra) {
    var vo = this.maps[selector];
    if (vo.isSingle) {
      if (vo.instance && 'setElement' in vo.instance) {
        vo.instance.setElement(nodes);
      } else {
        vo.instance = this.createMediator(nodes, vo.klass, extend(vo.options, extra));
      }
    } else {
      vo.instance = vo.instance || [];
      for (var i = 0, len = nodes.length; i < len; i++) {
        var mediator = this.createMediator(nodes[i], vo.klass, extend(vo.options, extra));
        vo.instance.push(mediator);
      }
    }
    return vo.instance;
  },
  createMediator: function (dom, className, options) {
    var param = this.isBackbone ? extend({el: dom}, options) : dom
      , mediator = this.$context.createInstance(className, param, options);
    return mediator;
  },
  getVO: function (selector) {
    return this.maps[selector];
  },
  hasMap: function (selector) {
    return !!this.maps[selector];
  },
  map: function (selector, className, options) {
    var vo = this.maps[selector]
      , flags  = extend({}, defaults, options);
    if (vo && vo.klass !== className) {
      if (flags.force) {
        vo.instance = null;
      } else {
        throw new Error(Mediator.errors.EXIST);
      }
    }
    this.maps[selector] = {
      klass: className,
      isSingle: flags.isSingle,
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
  this.inject(this.mediatorMap);
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
    this.inject(instance);
    klass.apply(instance, args);
    return instance;
  },
  getClass: function (key) {
    return this.mappings[key].klass;
  },
  getInjectValue: function (key, value) {
    var prefix = this.config.injectPrefix === '$' ? '\\$' : this.config.injectPrefix,
        preReg = new RegExp('^' + prefix + '([\\w\\-]+)$'),
        valueReg = new RegExp('^{{' + prefix + '([\\w\\-\\.]+)}}$');

    // get specific value first
    if (isString(value) && valueReg.test(value)) {
      var mapKey = value.match(valueReg)[1]
        , instance = this.getValue(mapKey) || (mapKey in this.mappings && this.getSingleton(mapKey));
      if (instance) {
        return instance;
      }

      var klass = parseNamespace(mapKey);
      if (klass) { // has specific type
        if (isFunction(klass)) { // need (to create) intance;
          for (mapKey in this.mappings) {
            if (!this.mappings.hasOwnProperty(mapKey)) {
              continue;
            }
            if (this.getClass(mapKey) === klass) {
              if (this.getSingleton(mapKey)) {
                return this.getSingleton(mapKey);
              } else {
                instance = this.createInstance(mapKey);
                this.mapSingleton(mapKey, instance);
                return instance;
              }
            }
          }

          instance = this.createInstance(klass);
          this.mapSingleton(value, klass, instance);
          return instance;
        } else {
          this.mapValue(value, klass);
          return klass;
        }
      }
    }

    // then search in key
    if (preReg.test(key)) {
      key = key.match(preReg)[1];
      if (key in this.valueMap) {
        return this.getValue(key);
      } else if (key in this.mappings) {
        return this.getSingleton(key);
      }
    }

    return arguments.length === 1 ? key : value;
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
    for (var key in target) { // 确保继承的属性也能被注入ey))
      target[key] = this.getInjectValue(key, target[key]);
    }
    if ('postConstruct' in target && isFunction(target.postConstruct)) {
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
    this.eventMap[event] = this.eventMap[event] || [];
    this.eventMap[event].push({
      command: command,
      context: context
    });
    return this;
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
  mapValue: function (key, value, isForce) {
    if (!isForce && this.hasValue(key)) {
      throw new Error(Context.errors.SOMETHING_EXIST);
    }
    this.valueMap[key] = value;
    return this;
  },
  removeEvent: function (event, command, context) {
    var retain, events, i, len;
    if (!event && !command && !context) {
      this.eventMap = void 0;
      return this;
    }
    for (var evt in this.eventMap) {
      if (event && event !== evt) {
        continue;
      }
      events = this.eventMap[evt];
      this.eventMap[evt] = retain = [];
      if (command || context) {
        for (i = 0, len = events.length; i < len; i++) {
          event = events[i];
          if (command && command !== event.command || context && context !== event.context) {
            retain.push(event);
          }
        }
      }
      if (!retain.length) {
        delete this.eventMap[evt];
      }
    }
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
    if (!(event in this.eventMap)) {
      return;
    }
    var args = slice.call(arguments, 1),
        handlers = this.eventMap[event];
    args.push(this);
    for (var i = 0, len = handlers.length; i < len; i++) {
      var eventObj = handlers[i];
      eventObj.command.apply(eventObj.context || this, args);
    }
  }
};

}(this));