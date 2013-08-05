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
};
var MappingVO = function (klass, instance) {
  this.klass = klass;
  this.instance = instance;
}
var Errors = {
  NOT_A_CLASS: '[Error Nervenet.context.mapClass] the second parameter is invalid, a class is expected',
  SOMETHING_EXIST: '[Error Nerver.context.mapClass/mapSingleton/mapValue] the mapping already exist'
};
Context.prototype = {
  createInstance: function (klass) {
    var args = slice.call(arguments, 1);
    klass = isString(klass) ? this.getClass(klass) : klass;
    var instance = new klass(args);
    this.inject(instance);
    return instance;
  },
  getClass: function (key) {
    return this.mappings[key].klass;
  },
  getSingleton: function (key) {
    if (!(key in this.mappings)) {
      throw new Error('no such class');
    }
    if (!this.mappings[key].instance) {
      this.mappings[key].instance = this.createInstance(key);
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
          for (var key in this.mappings) {
            if (this.getClass(key) === type) {
              if (this.getSingleton(key)) {
                target[name] = this.getSingleton(key);
              } else {
                target[name] = this.createInstance(key);
                this.mapSingleton(key, target[name]);
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
      if (key in this.valueMap) {
        target[name] = this.getValue(key);
        continue;
      }
      if (key in this.mappings) {
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
    if (this.hasMapping(key)) {
      throw new Error(Errors.SOMETHING_EXIST);
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
      throw new Error(Errors.SOMETHING_EXIST);
    }
    if (instance) {
      this.mappings[alias] = new MappingVO(constructor, instance);
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
      throw new Error(Errors.SOMETHING_EXIST);
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