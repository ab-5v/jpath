var jpath = require('../jpath') 
  , jsdom = require('jsdom');

var window = jsdom.jsdom().createWindow();

var jsonstr = '{"items":[1,2,3,4]}';
var obj = window.JSON.parse(jsonstr);
var r = jpath(obj , '.items');

console.log(window.Array === global.Array);
console.log(obj.items instanceof Array);
console.log(Object.prototype.toString.call(obj.items) === '[object Array]');

console.log(r);  // [ [ 1, 2, 3, 4 ] ]
 

