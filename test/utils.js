/**
 * Created with JetBrains WebStorm.
 * Date: 13-8-3
 * Time: 下午7:22
 * @overview
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since
 */

test('extend', 2, function () {
  var from = {
      id: 1
    }
    , to = {}
    , one;
  extend(to, from);
  one = extend(null, to);
  ok(to.id === 1, 'Passed!');
  ok(one.id === 1, 'Passed!');
});