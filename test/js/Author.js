/**
 * Created by 路佳 on 2015/1/11.
 */
function Author(first, last) {
  this.firstName = first;
  this.lastName = last;
}
Author.prototype = {
  getFullName: function () {
    return this.firstName + this.lastName;
  }
};

module.exports = Author;