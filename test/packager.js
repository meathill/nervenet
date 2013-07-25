/**
 * Created with JetBrains WebStorm.
 * Date: 13-7-25
 * Time: 上午12:18
 * @overview packager测试用例
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1
 */

test('get path', function () {
  var package = 'com.meathill.Sample';
  equal(getPath(package), './js/com/meathill/Sample.js');
});

//test('');
/*test("parse function", function () {
  var startup = function () {
    "import com.meathill.test";

    var a = 1,
        b = 2;
    console.log(a + b);
  };
  packager.parse(startup);
});*/