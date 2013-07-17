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
  context.injectInto(sample);
  var instance = new sample();
  ok('app' in instance, 'injected!');
  equal(instance.app, context, 'receive context!');
});

test('init injector', function () {
  var context = new Context();
  Nervenet.createNameSpace('com.meathill.test');
  com.meathill.test.Sample = function () {

  }
  context.init();
  var instance = new com.meathill.test.Sample();

  ok('app' in instance, 'injected!');
});

test('init injector with exclusive', function () {
  var context = new Context();
  Nervenet.createNameSpace('com.meathill.test');
  com.meathill.test.Sample = function () {

  }
  context.init('com.meathill');
  var instance = new com.meathill.test.Sample();

  ok(!('app' in instance), 'not injected!');
});

test('map singleton', function () {
  var context = new Context(),
      count = 0,
      func = function () {
        count += 1;
        this.getCount = function () {
          return count;
        }
      };
  context.mapSingleton(func, 'test');
  var test1 = context.getSingleton('test'),
      test2 = context.getSingleton('test');
  ok(test1 === test2, 'It is singleton');
  equal(count, 1, 'Only run once');
});

test('map singleton instance', function () {
  var context = new Context(),
      count = 0,
      func = function () {
        count += 1;
        this.getCount = function () {
          return count;
        }
      },
      instance = new func();
  context.mapSingleton(instance, 'test');
  var test1 = context.getSingleton('test'),
      test2 = context.getSingleton('test');
  ok(test1 === test2, 'It is singleton');
  equal(count, 1, 'Only run once');
});

test('map event', function () {
  var context = new Context(),
      obj = {
        number: 1
      };
  context.mapEvent('check', function (curr) {
    equal(curr, 1, 'args ok');
    equal(this.number, 1, 'context ok');
    ok(arguments[1] === context, 'receive app');
  }, obj);
  context.trigger('check', 1);
});