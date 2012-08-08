/**
 * XPath for JSON with yate-like syntax
 *
 * @example
 *  jpath(json, '/.foo[.bar == "3" && !.gop || .soo].lop');
 *
 * @version 0.0.15
 * @author Artur Burtsev <artjock@gmail.com>
 * @link https://github.com/artjock/jpath
 *
 */

(function() {

// var jpath = function() {};

/**
 * Извлекает из объекта json значение,
 * хранящееся по пути path
 * @param {Object} json
 * @param {String} path
 */
var jpath = function(json, path) {

    // проверка типов
    // более подробная проверка есть в exec
    if (json === null || !path || typeof path !== 'string') {
        return [];
    }
    if (path === '.') { return [ json ]; }

    var steps = jpath.split(path);
    var res = jpath.exec(json, steps.slice(0, 2));

    for (var i = 2, l = steps.length; i < l && res !== jpath.nf; i += 2) {
        res = jpath.exec(res, steps.slice(i, i + 2));
    }

    // делаем, чтобы jpath всегда возвращал массив,
    // если ничего не найдено, то пустой массив
    if (res === jpath.nf) {
        return [];
    } else if (!jpath.util.isArray(res)) {
        return [res];
    } else {
        return res;
    }
};

/**
 * Существенное время занимает AST
 * его можно кэшировать
 */
jpath.caching = true;


jpath.version = '0.0.15'

if (typeof module !== 'undefined') {
    module.exports = jpath;
} else {
    window.jpath = jpath;
}

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

jpath.operators = {
    '!': {
        name: 'not',
        operand: 1
    },
    '==': {
        name: 'eq',
        operand: 2
    },
    '!=': {
        name: 'noteq',
        operand: 2
    },
    '&&': {
        name: 'and',
        operand: 2
    },
    '||': {
        name: 'or',
        operand: 2
    }
};

(function(){

/**
 * Регулярка для сплита jpath-a в шаги
 * @example
 *  '.foo[.bar].loo' -> ['foo[.bar]', 'loo'];
 * @type RegExp
 */
var reSplit = /\.(?![^\[]+\])/;

/**
 * Извелекает содержимое предиката
 * @type RegExp
 */
var rePredicate = /^([^\[]+)?\[(\s*[^\]]+)\s*\]$/;

var reIndex = /^(\d+)$/;

/**
 * Строку предиката заменяет на массив токенов
 */
var tokenizer = {
    /**
     * Массив с токенами - результат работы parse
     * @type Array
     */
    result: [],

    /**
    * Используется для заполнения строки предиката пробелами,
    * когда из него извлекаются значения
    * @type String
    */
    placeholder: Array(100).join(' '),

    /**
     * Типы токенов, котрые могу встретиться в предикате
     * в формате [re1, replacer1, re2, replacer2, ...]
     * порядок важен
     * @type Array
     */
    parsers: [
        // string
        /"([^"]*?)"/g,
        function(self, match, index) {
            tokenizer.result[index] = ['string', match];
            return tokenizer.placeholder.substr(0, self.length);
        },
        // node
        /(\.[^=\s!]*)/g,
        function(self, match, index) {

            if (match === '.') {
                match = '';
            } else {
                match = jpath.split(match);

                if (match.length === 2) {
                    match = match[1];
                }
            }

            tokenizer.result[index] = ['node', match];
            return tokenizer.placeholder.substr(0, self.length);
        },
        // operator
        /(==|!=|!|\|\||&&)/g,
        function(self, match, index) {
            tokenizer.result[index] = ['operator', match];
            return tokenizer.placeholder.substr(0, self.length);
        }
    ],

    /**
     * Заменяет предикат набором токенов
     * @example
     *  '.foo == "bar"' -> ['node', 'foo', 'operator', '==', 'string', 'bar']
     * @param {String} predicate
     * @type {Array}
     */
    parse: function(predicate) {
        this.result = [];

        for (var i = 0; i < this.parsers.length; i+=2) {
            predicate = predicate.replace(this.parsers[i], this.parsers[i+1]);
        }

        return this.result;
    }
};

/**
 * Заменяет операции в предикатах функциями
 * @param {Array} tokens
 * @type Array
 */
var regroup = function(tokens) {
    var operators = jpath.operators;

    // перебираем операции в порядке приоритета
    for (var key in operators) {
        var operator = operators[key];
        // просматриваем токены на наличие операции данного приоритета
        for (var i = 0; i < tokens.length; i+=2) {
            if (tokens[i] === 'operator' && tokens[i + 1] === key) {
                // унарные операции
                if (operator.operand == 1) {
                    // нужно токен идущий за операцией сделать вложенным массивом опреации
                    // и убрать из исходного массива, а также операцию заменить функцией
                    tokens[i] = operator.name;
                    tokens[i+1] = tokens.splice(i + 2, 2);

                } else if (operator.operand == 2) {
                    // нужно предыдущий и следующий токены поместить в массив
                    // и заменить операцию именем функции
                    var operands = [].concat(tokens.slice(i - 2, i), tokens.slice(i + 2, i + 4));
                    tokens[i] = operator.name;
                    tokens[i+1] = operands;

                    // удаляем сначала спереди потом сзади, чтобы не сбить индексы
                    tokens.splice(i + 2, 2);
                    tokens.splice(i - 2, 2);
                }
            }
        }
    }

    return tokens;

};

/**
 * Кэш path <-> AST
 * @type Object
 */
var cache = {};

/**
 * Сплитит jpath в массив,
 * который потом используется для поиска по json-у
 * @example
 *  '.foo' -> ['node', 'foo']
 *  '.foo[.bar]' -> ['node', 'foo', 'pred', ['node', 'bar']]
 */
jpath.split = function(path) {

    if (jpath.caching && path in cache) {
        return cache[path];
    }

    var step, tokens;
    var result = [];
    var compact = jpath.util.compact;
    var flatten = jpath.util.flatten;
    var steps = path.split(reSplit);

    if (steps[0] === '' || steps[0] === '/') {
        steps = steps.slice(1);
    }

    while (step = steps.shift()) {
        var match = step.match(rePredicate);

        // если удалось извлечь предикат
        if (match) {
            var predicate = match[2];
            var mIndex = predicate.match(reIndex);

            // сначала делаем лёгкую проверку на индекс (.foo[1])
            if (mIndex) {
                tokens = ['index', mIndex[1] - 0];
            // если в предикате не индекс - делаем полную проверку
            } else {
                tokens = tokenizer.parse(predicate);
                tokens = flatten(compact(tokens));
                tokens = regroup(tokens);
            }

            if (match[1]) {
                result.push('node', match[1]);
            }
            result.push('predicate', tokens);

        } else {
            result.push('node', step);
        }
    }

    if (jpath.caching) {
        cache[path] = result;
    }

    return result;
};

})();

jpath.predicate = function() {};

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


})();
