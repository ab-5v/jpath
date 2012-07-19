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
        var carries = slice.call(arguments, 1);
        return function() {
            func.apply(null, carries.concat( slice.apply(arguments) ));
        }
    },

    /**
     * Удаляет все undefined из массива
     * @param {Array} arr
     * @type Array
     */
    compact: function(arr) {
        var res = [];

        for (var i = 0, l = arr.length; i < l; i++) {
            if (arr[i] !== undefined) {
                res.push(arr[i]);
            }
        }

        return res;
    },

    /**
     * Делает массивы плоскими
     * @param {Array} arr
     * @type Array
     */
    flatten: function(arr) {
        var res = [];

        for (var i = 0, l = arr.length; i < l; i++) {
            res = res.concat(arr[i]);
        }

        return res;
    }

});
})();
