/**
 * Created with JetBrains WebStorm.
 * Date: 13-5-25
 * Time: 下午12:41
 * @overview a group of functions
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1
 */

var slice = Array.prototype.slice,
    toString = Object.prototype.toString;

function isFunction(obj) {
  return toString.call(obj) === '[object Function]';
}
function isString(obj) {
  return toString.call(obj) === '[object String]';
}
function isArray(obj) {
  if ('isArray' in Array) {
    return Array.isArray(obj);
  }
  return Object.prototype.toString.call(obj) === '[object Array]';
}
function inherit(superClass, subClass) {
  var prototype = Object(superClass.prototype);
  prototype.constructor = subClass;
  subClass.prototype = prototype;
}
function extend(obj) {
  var args = slice.call(arguments, 1);
  for (var i = 0, len = args.length; i < len; i++) {
    var source = args[i];
    for (var prop in source) {
      obj[prop] = source[prop];
    }
  }
  return obj;
}
function parseNamespace(str) {
  if (!str) {
    return false;
  }
  var arr = str.split('.'),
      root = global[arr[0]];
  for (var i = 1, len = arr.length; i < len; i++) {
    if (!(arr[i] in root)) {
      return false;
    }
    root = root[arr[i]];
  }
  return root;
}