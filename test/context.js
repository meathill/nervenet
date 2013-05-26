/**
 * Created with JetBrains WebStorm.
 * Date: 13-5-25
 * Time: 下午1:10
 * @overview test context
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com)
 * @since 0.1
 */
test("create", function() {
  ok(new Context(), "Passed!");
});

test("load config", function () {
  var context = new Context();
  function config() {
    return this;
  }
  var runner = context.config(config);
  ok(runner === context, 'Passed!');
});

test('inject class', function () {
  var context = new Context();
  function sample() {

  }
  context.inject(sample);
  var instance = new sample();
  ok('app' in instance, 'injected!');
  equal(instance.app, context, 'receive context!');
});

test('init injector', function () {
  var context = new Context();
  Context.createNameSpace('com.meathill.test');
  com.meathill.test.Sample = function () {

  }
  context.initInjector();
  var instance = new com.meathill.test.Sample();

  ok('app' in instance, 'injected!');
});

test('init injector with exclusive', function () {
  var context = new Context();
  Context.createNameSpace('com.meathill.test');
  com.meathill.test.Sample = function () {

  }
  context.initInjector('com.meathill');
  var instance = new com.meathill.test.Sample();

  ok(!('app' in instance), 'not injected!');
});