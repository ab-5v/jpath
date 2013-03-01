var jpath = require('../jpath.min.js') 
  , jsdom = require('jsdom');

var window = jsdom.jsdom().createWindow();

var jsonstr = '{"items":[1,2,3,4]}';
var obj = window.JSON.parse(jsonstr);

console.log(window.Array === global.Array);           //false
console.log(obj.items instanceof Array);              //false
console.log(obj.items instanceof window.Array);       //true
console.log(Object.prototype.toString.call(obj.items) === '[object Array]'); //true

var r = jpath(obj , '.items');
console.log(r);  // output [[1,2,3,4]] but expect [1,2,3,4]
 

