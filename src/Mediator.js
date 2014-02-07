/**
 * Created by meathill on 14-2-7.
 */
var Mediator = function (container) {
  this.maps = {};
  this.container = container;
};

Mediator.prototype = {
  $context: null,
  isBackbone: false,
  check: function (container) {
    container = container || this.container;
    for (var selector in this.maps) {
      var nodes = container.querySelectorAll(selector)
        , classes = this.maps[selector];
      if (nodes.length > 0) {
        for (var i = 0, len = nodes.length; i < len; i++) {
          for (var j = 0, jlen = classes.length; j < jlen; j++) {
            this.createMediator(nodes[i], classes[j].klass, classes[j].options)
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
  hasMap: function (selector) {
    return !!this.maps[selector];
  },
  map: function (selector, className, options) {
    var classes = this.maps[selector] || [];
    if (classes.indexOf(className) === -1) {
      classes.push({
        klass: className,
        options: options
      });
    }
    this.maps[selector] = classes;
  }
};