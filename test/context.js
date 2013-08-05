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
  this.$book = '';
  this.$store = 'BookStore';
}
function Book() {
  this.title = 'The Song of Fire and Ice';
}
function BookStore() {
  this.name = 'Torchlight';
  this.sell = function (book) {

  };
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
  ok(context.hasValue(KEY));
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

  context.config.injectPrefix = '';
  context.inject(instance);
  ok(instance.author === Author, 'injected again!');
});

test('inject instance', function () {
  var context = new Context(),
      instance = new Sample(),
      book = new Book();
  context
    .mapSingleton('book', book)
    .inject(instance);
  ok(instance.$book === book, 'inject singleton');
});

test('inject with specific type', function () {
  var context = new Context(),
      instance = new Sample();
  context
    .mapClass('somestore', BookStore)
    .inject(instance);
  ok(instance.$store instanceof BookStore, 'inject with BookStore');
});

test('map class', function () {
  var context = new Context();
  context.mapClass(KEY, Sample);
  ok(context.getClass(KEY) === Sample);
  ok(context.hasMapping(KEY));
  context.removeMapping(KEY);
  ok(!context.hasMapping(KEY));
});

test('create instance', function () {
  var context = new Context();
  context.mapValue(KEY, Author);
  var instance = context.createInstance(Sample);
  ok(instance instanceof Sample, 'create by Constructor');
  ok(instance.$author === Author, 'injected!');

  context.mapClass('sample', Sample);
  instance = context.createInstance('sample');
  ok(instance instanceof Sample, 'create by mapname');
  ok(instance.$author === Author, 'injected!');
});

test('map singleton', function () {
  var context = new Context();
  context.mapSingleton('sample', Sample);
  var test1 = context.getSingleton('sample'),
      test2 = context.getSingleton('sample');
  ok(test1 === test2, 'It is singleton');
});

test('map singleton instance', function () {
  var context = new Context(),
      instance = new Sample();
  context.mapSingleton('sample', instance);
  var test1 = context.getSingleton('sample'),
      test2 = context.getSingleton('sample');
  ok(test1 === test2, 'It is singleton');
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