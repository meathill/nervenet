/**
 * Nerve Net Library
 * https://github.com/meathill/nervenet
 *
 * Copyright 2013 All contributors
 * Released under the MIT license
 */
(function () {
  // save a reference to the global object
  var root = this;
  var Nervenet;
  if (typeof exports !== 'undefined') {
    Nervenet = exports;
  } else {
    Nervenet = root.Nervenet = {};
  }

  Nervenet.VERSION = '@VERSION@';
  Nervenet.createContext = function () {
    return new Context();
  };