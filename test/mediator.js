/**
 * Created by meathill on 14-2-7.
 */
function SomeMediator(view, options) {
  this.$view = $(view);
  this.token = options.token;
  if (options.hasExtra) {
    this.$view.append('<p class="extra">extra</p>');
  }
  this.registerEvents();
  console.log(options.token);
}
SomeMediator.prototype = {
  $token: null,
  events: {
    'click button': 'button_clickHandler'
  },
  registerEvents: function () {
    for (var prop in this.events) {
      var pair = prop.split(' ');
      if (pair.length > 1) {
        this.$view.on(pair[0], pair[1], $.proxy(this.button_clickHandler, this));
      } else {
        this.$view.on(prop, $.proxy(this.button_clickHandler, this));
      }
    }
  },
  setElement: function (view) {
    this.$view = $(view);
  },
  button_clickHandler: function () {
    this.$view.find('button').val(this.token);
    if (this.$token) {
      alert(this.$token);
    }
  }
};
function ArgsMediator(view, username, age) {
  this.username = username;
  this.age = age;
}

var container = document.getElementById('my-dom')
  , SELECTOR = '.some'
  , NODE = $('.some', container)
  , NODES = $('.group', container);

QUnit.config.reorder = false;

test("map mediator", function () {
  var m = new Mediator();
  m.map(SELECTOR, SomeMediator);
  ok(m.hasMap(SELECTOR));
});

test("remove mediator", 2, function () {
  var m = new Mediator();
  m.map(SELECTOR, SomeMediator);
  ok(m.hasMap(SELECTOR));

  m.removeMap(SELECTOR);
  ok(!m.hasMap(SELECTOR));
});

test("simple create mediator", function () {
  var context = new Context()
    , options = {
      token: Date.now().toString()
    };
  context.mediatorMap.createMediator(NODE, SomeMediator, options);
  $('button', container).click();

  ok($('button', container).val() === options.token);
});

test("create single mediator for nodes", 2, function () {
  var context = new Context()
    , options = {
      isSingle: true,
      token: Date.now().toString()
    };
  context.mediatorMap.map(SELECTOR, SomeMediator, options);
  context.mediatorMap.check(container);
  $('button', container).click();

  ok($('button', container).val() === options.token);
  ok(context.mediatorMap.getVO(SELECTOR).instance instanceof SomeMediator);
});

test("create multiple mediator for nodes", 2, function () {
  var context = new Context()
    , options = {
      token: Date.now().toString()
    };
  context.mediatorMap.map('.group', SomeMediator, options);
  context.mediatorMap.check(container);

  ok(isArray(context.mediatorMap.getVO('.group').instance));
  ok(context.mediatorMap.getVO('.group').instance.length === NODES.length);
});

test('create mediator with extra data', 1, function () {
  var context = new Context()
    , options = {
      token: Date.now().toString()
    }
    , extra = {
      hasExtra: true
    };
  context.mediatorMap.map('.some', SomeMediator, options);
  context.mediatorMap.check(container, extra);

  ok(NODE.find('.extra').text() === 'extra');
});

test("inject view", function () {
  var context = new Context()
    , options = {
      token: Date.now().toString()
    };
  context.mapValue('token', 'abracadabra');
  var sm = context.mediatorMap.createMediator(NODE, SomeMediator, options);

  ok(sm.$token === context.getValue('token'));
});