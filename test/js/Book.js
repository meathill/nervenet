/**
 * Created by 路佳 on 2015/1/11.
 */

var Author = require('./Author')
  , dependency = require('./dependency');

function Book(title, pubDate) {
  this.author = new Author();
  this.title = title;
  this.pubDate = pubDate;
}

