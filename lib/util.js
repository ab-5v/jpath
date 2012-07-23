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

var concat = Array.prototype.concat;

jpath.util = jpath.extend({

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
     * Выравнивает массив на один уровень
     *  [1,2,[3],4] -> [1,2,3,4]
     * @param {Array} arr
     * @type Array
     */
    flatten: function(arr) {
        return concat.apply([], arr);
    },

    /**
     * Если нужно, чтобы работало в разных фреймах,
     * заменить на toString()
     * @param {Array} arr
     * @type Boolean
     */
    isArray: function(arr) {
        return arr instanceof Array;
    }

});
})();
