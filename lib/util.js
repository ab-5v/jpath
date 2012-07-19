(function() {
jpath.extend = function(to, from) {
    if (!from) {
        from = to;
        to = {};
    }

    for (var key in from) {
        to[key] = from[key];
    }

    return to;
};

jpath.util = jpath.extend({
    /**
     * Прокидывает параметр в вызов функции
     * @param {Function} func
     * @param {Object} param
     */
    carry: function(func) {
        var slice = Array.prototype.slice;
        var carries = slice.apply(arguments, 1);
        return function() {
            func.apply(null, carries.concat( slice.apply(arguments) ));
        }
    }

});
})();
