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
var rePredicate = /([^\[]+)\[([^\]]+)\]/;

var reIndex = /^\s*(\d+)\s*$/;

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
        /("|')([^\1]*?)\1/g,
        function(self, quote, match, index) {
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
 * Сплитит jpath в массив,
 * который потом используется для поиска по json-у
 * @example
 *  '.foo' -> ['node', 'foo']
 *  '.foo[.bar]' -> ['node', 'foo', 'pred', ['node', 'bar']]
 */
jpath.split = function(path) {
    var step;
    var result = [];
    var compact = jpath.util.compact;
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
                tokens = Array.prototype.concat.apply([], compact(tokens));
                tokens = regroup(tokens);
            }

            result.push('node', match[1]);
            result.push('predicate', tokens);

        } else {
            result.push('node', step);
        }
    }

    return result;
};

})();
