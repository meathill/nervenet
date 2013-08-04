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
  NOT_A_CLASS: '[Error Nervenet.context.mapClass]'
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
          value = target[name];
      if (value && checkNamespace(value)) {

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
    this.constructors[key] = constructor;
  },
  mapEvent: function (event, command, context) {
    this.eventMap[event] = this.eventMap.event || [];
    this.eventMap[event].push({
      command: command,
      context: context
    });
  },
  mapSingleton: function (alias, constructor, instance) {
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