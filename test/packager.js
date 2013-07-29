/**
 * Created with JetBrains WebStorm.
 * Date: 13-7-25
 * Time: 上午12:18
 * @overview packager测试用例
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1
 */

test('get path', function () {
  var fullname = 'com.meathill.Sample';
  equal(getPath(fullname), 'js/com/meathill/Sample.js');
});

test('create script', function () {
  var funcstr = "function Sample() { console.log('ok'); }";
  createScript(funcstr);
  ok('Sample' in window);
});

test("parse function", function () {
  var startup = function () {
    "import com.meathill.Super";

    var me = new Super();
    console.log(me.getFullName());
  };
  Packager.reset();
  Packager.parse(startup);
  ok(queue.length, 'has item');
  deepEqual(queue[0], {
    className: 'Super',
    fullname: 'com.meathill.Super',
    type: 'import',
    content: ''
  }, 'item ok');
});

asyncTest('start with callback', function () {
  var startup = function () {
    "import com.meathill.Super";

    var me = new Person();

    ok(me, "load success");
    equal(me.getFullName(), 'Meathill Homestayer');
    start();
  };

  Packager.start(startup, this);
});

asyncTest("load queue", function () {
  var startup = function () {
    "import com.meathill.UseSuper";

    var book = new Book('Shitman');

    ok(book, "load success");
    equal(book.getDetail(), 'Shitman by Mui Zhai');
    start();
  };

  Packager.start(startup, this);
});

asyncTest("use by dependencies", function () {
  var startup = function () {
    "import com.meathill.Sub";

    var mate = new Student('Anna', 'Chen', 2);

    ok(mate, "load success");
    equal(mate.getDetail(), 'Anna Chen at Grade.2');
    start();
  };

  Packager.start(startup, this);
});