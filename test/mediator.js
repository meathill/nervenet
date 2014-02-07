/**
 * Created by meathill on 14-2-7.
 */
function SomeMediator(view, options) {
  this.$view = view;
  this.token = options.token;
  this.registerEvents();
  console.log(options.token);
}
SomeMediator.prototype = {
  $token: null,
  events: {
    'click button': 'button_clickHandler',
    'remove': 'removeHandler'
  },
  registerEvents: function () {
    for (var prop in this.events) {
      var pair = prop.split(' ');
      if (pair.length > 1) {
        $(this.$view).on(pair[0], pair[1], $.proxy(this.button_clickHandler, this));
      } else {
        $(this.$view).on(prop, $.proxy(this.button_clickHandler, this));
      }
    }
  },
  button_clickHandler: function (event) {
    this.$view.getElementsByTagName('button')[0].value = this.token;
    if (this.$token) {
      alert(this.$token);
    }
  },
  removeHandler: function (event) {
    this.$view.off();
  }
}
var container = document.getElementById('my-dom'),
    node = $('.some', container);

QUnit.config.reorder = false;

test("map mediator", function () {
  var m = new Mediator();
  m.map('.some', SomeMediator);
  ok(m.hasMap('.some'));
});

test("create mediator", function () {
  var m = new Mediator()
    , options = {
      token: Date.now().toString()
    };
  m.createMediator(node[0], SomeMediator, options);
  $('button', container).click();

  ok($('button', container).val() === options.token);
});

test("create mediators for a container", function () {
  var m = new Mediator()
    , options = {
      token: Date.now().toString()
    };
  m.map('.some', SomeMediator, options);
  m.check(container);
  $('button', container).click();
  //node.trigger('remove');

  ok($('button', container).val() === options.token);
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
  var sm = m.createMediator(node[0], SomeMediator, options);

  ok(sm.$token === context.getValue('token'));
});