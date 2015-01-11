/**
 * Created by 路佳 on 2015/1/12.
 */

var configure = Configure.extend({
  $context: null,
  configure: function () {
    this.$context.mapEvent('ready', this.createBook);
  },
  createBook: function () {
    var book = new Book();
  }
});