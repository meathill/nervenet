;(function (window) {
  var Person = function (first, last) {
    this.firstName = first || 'Meathill';
    this.lastName = last || 'Homestayer';
    this.getFullName = function () {
      return this.firstName + ' ' + this.lastName;
    };
  };
  window.Person = Person;
}(window));