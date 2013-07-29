/**
 * Created with JetBrains WebStorm.
 * Date: 13-7-27
 * Time: 上午10:56
 * @overview
 * @author Meathill <meathill@gmail.com> (http://blog.meathill.com/)
 * @since
 */
;(function (window) {
  "extend com.meathill.Super";

  var Student = function (firstName, lastName, grade) {
    Person.call(this, firstName, lastName);
    this.grade = grade;
    this.getDetail = function () {
      return this.getFullName() + ' at Grade.' + this.grade;
    }
  };
  inherit(Person, Student);
  window.Student = Student;
}(window));