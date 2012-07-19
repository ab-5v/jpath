/**
 * XPath for JSON with yate-like syntax
 *
 * @example
 *  jpath(json, '/.foo[.bar == "3" && !.gop || .soo].lop');
 *
 * @version 0.0.2
 * @author Artur Burtsev <artjock@gmail.com>
 *
 */

(function() {

// var jpath = function() {};
require('lib/jpath.js');

if (typeof exports !== 'undefined') {
    exports = jpath;
} else {
    window.jpath = jpath;
}

require('lib/util.js');
require('lib/operator.js')
require('lib/split.js');
require('lib/predicate.js')
require('lib/exec.js')

})();
