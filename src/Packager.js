/**
 * Created with JetBrains WebStorm.
 * Date: 13-7-15
 * Time: 下午11:26
 * @overview handle class dependency and create load queue
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1
 */
var REG = /import ((\w+\.)+\w+)/ig,
    queue = [],
    isLoading = false,
    head = document.getElementsByTagName('head')[0] || document.documentElement,
    baseElement = head.getElementsByTagName('base')[0];

function onload() {
  this.onload = this.onerror = this.onreadystatechange = null;

  packager.loadNext();
}

var packager = {
  loadNext: function () {
    var node = document.createElement('script');
    node.async = true;
    node.src = queue.shift();
    node.onload = node.onerror = node.onreadystatechange = onload;

    if (baseElement) {
      head.insertBefore(node, baseElement)
    } else {
      head.appendChild(node);
    }
  },
  parse: function (str) {
    var classes = str.match(REG);
    for (var i = 0, len = classes.length; i < len; i++) {
      if (this.queue.indexOf(classes[i]) === -1) {
        queue.push(classes[i]);
      }
    }
    if (!isLoading) {
      this.loadNext();
    }
  },
  onComplete: function (callback) {
    callback();
  }
};