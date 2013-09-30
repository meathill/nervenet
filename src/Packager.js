/**
 * Created with JetBrains WebStorm.
 * Date: 13-7-15
 * Time: 下午11:26
 * @overview handle class dependency and create load queue
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1
 */
var REG = /(import|extend) ((\w+\.)+(\w+))/ig,
    index = 0,
    queue = [],
    ordered = [],
    startup = {},
    head = document.getElementsByTagName('head')[0] || document.documentElement,
    baseElement = head.getElementsByTagName('base')[0],
    xhr = new XMLHttpRequest();

xhr.onload = function () {
  queue[index].content = this.response;
  Packager.parse(this.response);
  index++;
  Packager.loadNext();
}
function getPath(str) {
  return config.dir + '/' + str.split('.').join('/') + '.js';
}
function createScript(str, className) {
  className = className || '';
  var script = document.createElement('script');
  script.className = 'nervenet ' + className;
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
      for (var j = 0, qlen = queue.length; j < qlen; j++) {
        if (queue[j].fullname === ordered[i]) {
          createScript(queue[j].content, queue[j].className);
          queue.splice(j, 1);
          break;
        }
      }
    }

    if ('func' in startup) {
      startup.func.call(startup.context);
    }
  },
  loadNext: function () {
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
          var item = {
            fullname: fullname,
            className: fullname.slice(fullname.lastIndexOf('.') + 1),
            type: classes[i].substr(0, 6),
            content: ''
          };
          queue.push(item);
          if (item.type === 'import') {
            ordered.push(fullname);
          } else {
            var sub = queue[index].fullname,
                offset = ordered.indexOf(sub);
            ordered.splice(offset, 0, fullname);
          }
        }
      }
    }
  },
  reset: function () {
    index = 0;
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