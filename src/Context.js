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
  this.injector = new Injector();
}
Context.prototype = {
  injector: null,
  config: function (func) {
    func.call(this);
    return this;
  },
  createNameSpace: function (ns, root) {
    var arr = ns.split('.'),
        root = root || window;
    for (var i = 0, len = arr.length; i < len; i++) {
      root[arr[i]] = root[arr[i]] || {};
      root = root[arr[i]];
    }
    return root;
  },
  import: function () {

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