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
    return this.voMap[key];
  },
  hasValue: function (key) {
    return key in this.voMap;
  },
  inject: function (constructor) {
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
    this.voMap[key] = value;
    return this;
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