/**
 * Created with JetBrains WebStorm.
 * Date: 13-7-15
 * Time: 下午11:26
 * @overview handle class dependency and create load queue
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1
 */
var REG = /(import|extend) ((\w+\.)+(\w+))/ig,
    index = -1,
    queue = [],
    ordered = [],
    startup = {},
    head = document.getElementsByTagName('head')[0] || document.documentElement,
    baseElement = head.getElementsByTagName('base')[0],
    xhr = new XMLHttpRequest();

xhr.onload = function () {
  queue[index].content = this.response;
  packager.parse(this.response);
}
function getPath(str) {
  return config.dir + '/' + str.split('.').join('/') + '.js';
}
function createScript(str) {
  var script = document.createElement('script');
  script.innerHTML = str;
  if (baseElement) {
    head.insertBefore(script, baseElement);
  } else {
    head.appendChild(script);
  }
}

var packager = {
  createNodes: function () {
    for (var i = 0, len = ordered.length; i < len; i++) {
      for (var j = 0; j < len; j++) {
        if (queue[j].className === ordered[i]) {
          break;
        }
      }
      createScript(queue[j].content);
    }

    if (startup) {
      startup.func.call(startup.context);
    }
  },
  loadNext: function () {
    index++;
    if (index === queue.length) {
      this.createNodes();
    }

    xhr.open('get', queue[index].url);
    xhr.send();
  },
  parse: function (str) {
    if (!str) {
      return;
    }
    if (isFunction(str)) {
      str = str.toString();
    }
    var classes = str.match(REG);
    for (var i = 0, len = classes.length; i < len; i++) {
      if (ordered.indexOf(classes[i]) === -1) {
        queue.push({
          className: classes[i].slice(classes[i].lastIndexOf('.') + 1),
          url: getPath(classes[i].slice(7)),
          type: classes[i].substr(0, 6),
          content: ''
        });
        ordered.push(classes[i][2]);
      }
    }
    this.loadNext();
  },
  onComplete: function (callback, context) {
    startup = {
      func: callback,
      context: context
    };
  }
};