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