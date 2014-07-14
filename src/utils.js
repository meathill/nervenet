/**
 * Created with JetBrains WebStorm.
 * Date: 13-5-25
 * Time: 下午12:41
 * @overview a group of functions
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1
 */

var slice = Array.prototype.slice
  , toString = Object.prototype.toString
  , OBJECT_ARRAY = '[object Array]'
  , OBJECT_FUNCTION = '[object Function]'
  , OBJECT_OBJECT = '[object Object]'
  , OBJECT_STRING = '[object String]';

function isArray(obj) {
  if ('isArray' in Array) {
    return Array.isArray(obj);
  }
  return Object.prototype.toString.call(obj) === OBJECT_ARRAY;
}
function isFunction(obj) {
  return toString.call(obj) === OBJECT_FUNCTION;
}
function isObject(obj) {
  return obj === Object(obj) && toString.call(obj) === OBJECT_OBJECT;
}
function isString(obj) {
  return toString.call(obj) === OBJECT_STRING;
}
function isDom(obj) {
  return typeof HTMLElement === 'object' ? obj instanceof HTMLElement :
    obj && typeof obj === 'object' && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === 'string';
}
function object(obj) {
  function F() {}
  F.prototype = obj;
  return new F();
}
function inherit(superClass, subClass) {
  var prototype = object(superClass.prototype);
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
function parseNamespace(str, root) {
  if (!str) {
    return false;
  }
  var arr = str.split('.'),
      root = root || global;
  for (var i = 0, len = arr.length; i < len; i++) {
    if (!(arr[i] in root) || isDom(root[arr[i]])) {
      return false;
    }
    root = root[arr[i]];
  }
  return root;
}