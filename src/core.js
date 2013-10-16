/**
 * Created with JetBrains WebStorm.
 * Date: 13-7-15
 * Time: 下午9:55
 * @overview the NerveNet object
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since Nervenet对象
 */

var namespaces = {};
var Nervenet = global.Nervenet = {
  VERSION: '@VERSION@',
  createContext: function () {
    return new Context();
  },
  createNameSpace: function (ns, root) {
    var arr = ns.split('.'),
        root = root || global;

    // note first level namespace here
    namespaces[ns] = root;

    for (var i = 0, len = arr.length; i < len; i++) {
      root[arr[i]] = root[arr[i]] || {};
      root = root[arr[i]];
    }
    return root;
  },
  inherit: inherit,
  parseNamespace: parseNamespace,
  setConfig: function (key, value) {
    if (key in config) {
      config[key] = value;
    }
  }
};