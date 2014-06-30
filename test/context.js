/**
 * Created with JetBrains WebStorm.
 * Date: 13-5-25
 * Time: 下午1:10
 * @overview test context
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com)
 * @since 0.1
 */

function Sample(author) {
  this.author = author || '';
}
Sample.prototype = {
  $author: '',
  writer: '{{$author}}',
  $book: '',
  $store: 'BookStore',
  store2: '{{$somestore}}'
}
function SampleObj(options) {
  this.author = options.$author;
  this.writer = options.writer;
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
  ok(instance.writer === Author, 'injected by defination');

  context.config.injectPrefix = '';
  context.inject(instance);
  ok(instance.author === Author, 'injected again!');
  ok(instance.writer === Author, 'injected by defination again');
});

test('inject singleton', function () {
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
  ok(instance.store2 instanceof BookStore, 'inject with BookStore');
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

  var instance2 = context.createInstance(Sample, KEY);
  ok(instance2.$author === Author, 'injected from params');

  var instance3 = context.createInstance(SampleObj, {'$author': '', writer: '{{$author}}'});
  ok(instance3.author === Author, 'injected from init obj');
  ok(instance3.writer === Author, 'injected from init obj spec');

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

  context.mapSingleton('sample2', Sample, 'Meathill');
  var test3 = context.getSingleton('sample2');
  ok(test3 instanceof Sample);
  ok(test3.author === 'Meathill');
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

test('remove event', function () {
  var context = new Context()
    , obj = {
      number: 1
    };
  context.mapEvent('check', function (curr) {
    equal(curr, 1, 'map ok');
  }, obj);
  context.trigger('check', 1);
  context.removeEvent('check');
  ok(!('check' in context.eventMap));
});