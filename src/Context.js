/**
 * Created with JetBrains WebStorm.
 * Date: 13-5-25
 * Time: 下午12:34
 * @overview Build a context, let everything happen in this sandbox
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1
 */
'use strict';
var namespaces = {},
    Context = function () {
      this.injector = new Injector();
    };
Context.createNameSpace = function (ns, root) {
  var arr = ns.split('.'),
      root = root || window;

  // note first level namespace here
  namespaces[ns] = root;

  for (var i = 0, len = arr.length; i < len; i++) {
    root[arr[i]] = root[arr[i]] || {};
    root = root[arr[i]];
  }
  return root;
};
Context.prototype = {
  injector: null,
  config: function (func) {
    func.call(this);
    return this;
  },
  import: function () {

  },
  initInjector: function (exclusive) {
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
              node[className].prototype.app = this;
            }
          }
        }
      }
    }
  },
  inject: function (constructor) {
    constructor.prototype.app = this;
  },
  register: function (namespace, className, constructor) {
    var node = this.createNameSpace(namespace, this.root);
    constructor.prototype.app = this;
    node[className] = constructor;
  }
}