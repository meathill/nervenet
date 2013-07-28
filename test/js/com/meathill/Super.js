;(function (window) {
  var Super = function (first, last) {
    this.firstName = first || 'Meathill';
    this.lastName = last || 'Homestayer';
    this.getFullName = function () {
      return this.firstName + ' ' + this.lastName;
    }
  }
  window.Super = Super;
}(window));