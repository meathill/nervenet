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
  Packager.parse(this.response);
  Packager.loadNext();
}
function getPath(str) {
  return config.dir + '/' + str.split('.').join('/') + '.js';
}
function createScript(str) {
  var script = document.createElement('script');
  script.className = 'nervenet';
  script.innerHTML = str;
  if (baseElement) {
    head.insertBefore(script, baseElement);
  } else {
    head.appendChild(script);
  }
}

var Packager = {
  createNodes: function () {
    for (var i = 0, len = ordered.length; i < len; i++) {
      for (var j = 0; j < len; j++) {
        if (queue[j].fullname === ordered[i]) {
          break;
        }
      }
      createScript(queue[j].content);
    }

    if ('func' in startup) {
      startup.func.call(startup.context);
    }
  },
  loadNext: function () {
    index++;
    if (index >= queue.length) {
      this.createNodes();
      return;
    }

    xhr.open('get', getPath(queue[index].fullname));
    xhr.send();
  },
  parse: function (str) {
    if (isFunction(str)) {
      str = str.toString();
    }
    var classes = str.match(REG);
    if (classes) {
      for (var i = 0, len = classes.length; i < len; i++) {
        var fullname = classes[i].slice(7);
        if (ordered.indexOf(fullname) === -1) {
          queue.push({
            fullname: fullname,
            className: fullname.slice(fullname.lastIndexOf('.') + 1),
            type: classes[i].substr(0, 6),
            content: ''
          });
          ordered.push(fullname);
        }
      }
    }
  },
  reset: function () {
    ordered = [];
    queue = [];
  },
  start: function (callback, context) {
    this.reset();
    startup = {
      func: callback,
      context: context
    };

    this.parse(callback);
    this.loadNext();
  }
};