(function() {

var nf = jpath.nf;
var isArray = jpath.util.isArray;

var executors = {

    /**
     * Поиск ноды в объекте
     * @param {Object} json
     * @param {String} node
     * @param {Boolean} exist
     * @type Object
     */
    node: function(json, node, exist) {

        if (typeof json === 'object') {
            if (isArray(json)) {
                var arr = [];
                for (var i = 0, l = json.length; i < l; i++) {
                    var res = executors.node(json[i], node, exist);
                    if (res != nf) {
                        arr.push(res);
                    }
                }
                return exist ? !!arr.length : arr;
            } else {
                if (node in json) {
                    return exist ? true : json[node];
                }
            }
        }

        return exist ? false : nf;
    },

    /**
     * Возвращает объект нужного индекса
     * ищет только оп массивам
     * @param {Object} json
     * @param {String} node
     */
    index: function(json, index) {

        if (isArray(json)) {
            if (index < json.length) {
                return json[index];
            }
        }

        return nf;
    },

    /**
     * Просто возвращает строку
     * @param {Object} json
     * @param {String} node
     */
    string: function(json, string) {
        return string;
    },

    /**
     * Сравнивает два операнда 
     * и возвращает true или false в зависимости от резуьтата
     * @param {Object} json
     * @param {String} operand
     */
    not: function(json, operand) {
        return !jpath.exec(json, operand);
    },

    /**
     * Сравнивает два операнда 
     * и возвращает true или false в зависимости от резуьтата
     * @param {Object} json
     * @param {String} operands
     */
    eq: function(json, operands) {
        return jpath.exec(json, operands.slice(0, 2)) == jpath.exec(json, operands.slice(2));
    },

    /**
     * Сравнивает два операнда 
     * и возвращает true или false в зависимости от резуьтата
     * @param {Object} json
     * @param {String} operands
     */
    noteq: function(json, operands) {
        return jpath.exec(json, operands.slice(0, 2)) == jpath.exec(json, operands.slice(2));
    },

    /**
     * Сравнивает два операнда 
     * и возвращает true или false в зависимости от резуьтата
     * @param {Object} json
     * @param {String} operands
     */
    or: function(json, operands) {
        return jpath.exec(json, operands.slice(0, 2), true) || jpath.exec(json, operands.slice(2), true);
    },

    /**
     * Сравнивает два операнда 
     * и возвращает true или false в зависимости от резуьтата
     * @param {Object} json
     * @param {String} operands
     */
    and: function(json, operands) {
        return jpath.exec(json, operands.slice(0, 2), true) && jpath.exec(json, operands.slice(2), true);
    }
};

/**
 * Выполняет шаг
 * @param {Object} json входной json
 * @param {Array} step
 * @param {Boolean} exist проверить только существование, а значение не интересно
 */
jpath.exec = function(json, step, exist) {
    exist = !!exist;

    if (step[0] === 'predicate') {

        // если предикат выполняется в контексте массива и это не индекс
        // то нужно проверить предикат для каждого элемента массива и собрать результат
        if (isArray(json) && step[1][0] !== 'index') {
            var arr = [];

            for (var i = 0, l = json.length; i < l; i++) {
                var res = jpath.exec(json[i], step);
                if (res !== nf) {
                    arr.push(res);
                }
            }
            return arr;

        } else {
            // предположим что предикат может быть двух типов: проверяюший и выбирающий
            // проверяющий возвращает true|false и тогда возвращается json
            // выбирающий возвращает результат выбора и тогда возвращается он
            var res = jpath.exec(json, step[1], true);
            if (typeof res === 'boolean') {
                return res ? json : nf;
            } else {
                return res;
            }
        }
    } else {
        return executors[step[0]](json, step[1], exist);
    }
};


})();
