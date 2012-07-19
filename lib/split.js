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

/**
 * Регулярные выражения для извлечения
 * и группировки токенов из предиката
 * @type Object
 */
var reTokens = {
    'string': /("|')([^\1]*?)\1/g,
    'node': /(\.[^=\s!]*)/g,
    'index': /(\d+)/g,
    'operator': /(==|!=|!|\|\||&&)/g
};

/**
 * Используется для заполнения строки предиката пробелами,
 * когда из него извлекаются значения
 * @type String
 */
var placeholder = Array(100).join(' ');

var replace = function(result, type, self, match, index) {
    if (typeof index != 'number') {
        match = index;
        index = arguments[5];
    }

    if (type == 'index') {
        match = match-0;
    } else if (type == 'node') {
        match = jpath.split(match);
        if (match.length === 2) {
            match = match[1];
        }
    }

    result[index] = [type, match];

    return placeholder.substr(0, self.length);
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
    console.time(path);
    var step;
    var result = [];
    var carry = jpath.util.carry;
    var flatten = jpath.util.flatten;
    var compact = jpath.util.compact;
    var steps = path.split(reSplit).slice(1);

    while (step = steps.shift()) {
        var match = step.match(rePredicate);

        // если удалось извлечь предикат
        if (match) {
            result.push('node', match[1]);

            var tokens = [];
            var predicate = match[2];
            for (var type in reTokens) {
                predicate = predicate.replace(reTokens[type], carry(replace, tokens, type));
            }
            tokens = flatten(compact(tokens));
            tokens = regroup(tokens);

            result.push('predicate');
            result.push(tokens);

        } else {
            result.push('node', step);
        }
    }

    console.timeEnd(path);

    return result;
};

})();
