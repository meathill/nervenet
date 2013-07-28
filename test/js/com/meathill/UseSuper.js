/**
 * Created with JetBrains WebStorm.
 * Date: 13-7-28
 * Time: 下午6:59
 * @overview
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since
 */
;(function (window) {
  "import com.meathill.Super";
  var Book = function (title) {
    this.author = new Super('Mui', 'Zhai');

    this.title = title;

    this.getAuthor = function () {
      console.log(this.author.getFullName());
    }
  }
  window.Book = Book;
}(window));