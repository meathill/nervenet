/**
 * Created with JetBrains WebStorm.
 * Date: 13-8-3
 * Time: 下午7:22
 * @overview
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since
 */

test('extend', function () {
  var from = {
        id: 1
      }, to = {};
  extend(to, from);
  ok(from.id === 1, 'Passed!');
});