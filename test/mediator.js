/**
 * Created by meathill on 14-2-7.
 */
function SomeMediator(view, options) {
  this.$view = $(view);
  this.token = options.token;
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
  button_clickHandler: function () {
    this.$view.find('button').val(this.token);
    if (this.$token) {
      alert(this.$token);
    }
  },
  removeHandler: function () {
    this.$view.off();
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
  var m = new Mediator()
    , options = {
      token: Date.now().toString()
    };
  m.createMediator(NODE, SomeMediator, options);
  $('button', container).click();

  ok($('button', container).val() === options.token);
});

test("create mediator with args", 2, function () {
  var username = 'Jim Raynor'
    , age = 30
    , m = new Mediator()
    , options = [username, age]
    , mediator = m.createMediator(NODE, ArgsMediator, options);
  ok(mediator.username === username);
  ok(mediator.age === age);
});

test("create single mediator for nodes", 2, function () {
  var m = new Mediator()
    , options = {
      isSingle: true,
      token: Date.now().toString()
    };
  m.map(SELECTOR, SomeMediator, options);
  m.check(container);
  $('button', container).click();

  ok($('button', container).val() === options.token);
  ok(m.getVO(SELECTOR).instance instanceof SomeMediator);
});

test("create multiple mediator for nodes", 2, function () {
  var m = new Mediator()
    , options = {
      token: Date.now().toString()
    };
  m.map('.group', SomeMediator, options);
  m.check(container);

  ok(isArray(m.getVO('.group').instance));
  ok(m.getVO('.group').instance.length === NODES.length);
});

test("inject view", function () {
  var context = new Context()
    , m = new Mediator()
    , options = {
      token: Date.now().toString()
    };
  context
    .mapValue('token', 'abracadabra')
    .inject(m);
  var sm = m.createMediator(NODE, SomeMediator, options);

  ok(sm.$token === context.getValue('token'));
});