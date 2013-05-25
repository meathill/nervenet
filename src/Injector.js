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
    if (!(className in this.constructors)) {
      throw new Error('no such class');
    }
    if (!this.singletons[className]) {
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
  mapSingleton: function (className, constructor) {
    if (!isFunction(constructor)) {
      throw new Error('not a class');
    }
    this.constructors[className] = constructor;
  },
  trigger: function (eventType) {
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0, len = this.eventMap.length; i < len; i++) {
      var eventObj = this.eventMap[i];
      if (eventObj.type === eventType) {
        eventObj.command.apply(eventObj.context, args);
      }
    }
  }
}