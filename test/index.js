QUnit.test('hello', function (assert) {
  assert.ok(1 == '1', 'Passed!');
});

QUnit.test('init', function (assert) {
  var context = new Context();

  context
    .configure(configure)
    .start();

  context.trigger('ready');

  assert.ok($('#book').hasClass('meathill zhai'));
});