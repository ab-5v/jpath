(function() {

/**
 * Что вернёт jpath, когда ничего не найдено
 * С тех пор, как мы захотели всегда возвращать массив
 * используется внутри, чтобы определять,
 * что мы ничего не нашли по селектору
 * @private
 */
var nf = jpath.nf = undefined;
var isArray = jpath.util.isArray;

var cmp = function(lNode, rNode) {
    var lArr = isArray(lNode);
    var rArr = isArray(rNode);

    // массив всегда слева
    if (rArr && !lArr) {
        lArr = true;
        rArr = false;
        var tmp = rNode;
        rNode = lNode;
        lNode = tmp;
    }

    // массив с массивом
    if (lArr && rArr) {
        for (var li = lNode.length; li--;) {
            for (var ri = lNode.length; ri--;) {
                if (lNode[li] == rNode[ri]) {
                    return true;
                }
            }
        }
    // массив со скаляром
    } else if (lArr && !rArr) {
        for (var li = lNode.length; li--;) {
            if (lNode[li] == rNode) {
                return true;
            }
        }
    // скаляр со скаляром
    } else if (lNode == rNode){
        return true;
    }

    return false;
};

var executors = {

    /**
     * Поиск ноды в объекте
     * @param {Object} json
     * @param {String} node
     * @param {Boolean} exist
     * @type Object
     */
    node: function(json, node, exist) {

        // .a[. == 'some']
        if (node === '') {
            return json;
        }

        if (typeof json === 'object') {
            // в массиве нужно выполнить шаг для каждого элемента
            if (isArray(json)) {
                var arr = [];
                for (var i = 0, l = json.length; i < l; i++) {
                    var res = jpath.exec(json[i], ['node', node], exist);
                    if (res != nf) {
                        arr.push(res);
                    }
                }
                return exist ? !!arr.length : arr;
            // если в качестве нода вернулся массив, то это путь, нужно по нему пройти
            } else if (isArray(node)) {
                var res = json;
                for (var i = 0; i < node.length; i+=2) {
                    var res = jpath.exec(res, node.slice(i, i+2), exist);
                }
                return res;
            // иначе просто получаем значение node из json
            } else {
                if (node === '*') {
                    var arr = [];
                    for (var key in json) {
                        arr.push(json[key]);
                    }
                    return exist ? !!arr.length : arr;

                } else if (node in json) {
                    var val = json[node];
                    return exist ? !!(isArray(val) ? val.length : val) : json[node];
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
        return !jpath.exec(json, operand, true);
    },

    /**
     * Сравнивает два операнда 
     * и возвращает true или false в зависимости от резуьтата
     * @param {Object} json
     * @param {String} operands
     */
    eq: function(json, operands) {
        return cmp( jpath.exec(json, operands.slice(0, 2)), jpath.exec(json, operands.slice(2)) );
    },

    /**
     * Сравнивает два операнда 
     * и возвращает true или false в зависимости от резуьтата
     * @param {Object} json
     * @param {String} operands
     */
    noteq: function(json, operands) {
        return !cmp( jpath.exec(json, operands.slice(0, 2)), jpath.exec(json, operands.slice(2)) );
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
