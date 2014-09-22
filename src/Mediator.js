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