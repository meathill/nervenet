/**
 * Created with JetBrains WebStorm.
 * Date: 13-5-25
 * Time: 下午1:10
 * @overview test context
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com)
 * @since 0.1
 */

function Sample() {
  this.author = '';
  this.$author = '';
}

var KEY = 'author',
    Author = {
      name: 'Meathill',
      email: 'meathill@gmail.com'
    };

test("create", function() {
  ok(new Context(), "Passed!");
});

test('map value', function () {
  var context = new Context();
  context.mapValue(KEY, Author);
  ok(context.getValue(KEY) === Author);
  ok(context.hasValue(KEY) === true);
  context.removeValue(KEY);
  ok(context.hasValue(KEY) === false);
});

test('inject', function () {
  var context = new Context(),
      instance = new Sample();
  context
    .mapValue(KEY, Author)
    .inject(instance);
  ok(instance.$author === Author, 'injected!');

  config.injectPrefix = ''
  context.inject(instance)
  ok(instance.author === Author, 'injected again!');
});

test('create instance', function () {
  var context = new Context();
  function Sample() {

  }
  var instance = context.createInstance(Sample);
  ok(instance[config.context] === context);
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