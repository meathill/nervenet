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
};
Context.prototype = {
  config: function (func) {
    func.call(this);
    return this;
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
    constructor.prototype[config.context] = this;
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
  start: function (callback) {
    packager.parse(callback.toString());
    packager.onComplete(callback);
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
}