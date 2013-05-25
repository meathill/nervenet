/**
 * Created with JetBrains WebStorm.
 * Date: 13-5-25
 * Time: 下午2:06
 * @overview test injector
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since 0.1
 */
test('create', function () {
  ok(new Injector(), 'Passed!');
});

test('map singleton', function () {
  var injector = new Injector(),
      count = 0,
      func = function () {
        count += 1;
        this.getCount = function () {
          return count;
        }
      };
  injector.mapSingleton('test', func);
  var test1 = injector.getSingleton('test'),
      test2 = injector.getSingleton('test');
  ok(test1 === test2, 'It is singleton');
  equal(count, 1, 'Only run once');
});

test('map event', function () {
  var injector = new Injector();
  injector.mapEvent('check', function (curr) {
    equal(curr, 1, 'args ok');
    ok(this === injector, 'context ok');
  }, injector);
  injector.trigger('check', 1);
});