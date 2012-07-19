;(function() {

/**
 * Значение, которое вернётся в случае, если по jpath-у ничего не найдено
 */
var NOT_FOUND = undefined;

/**
 * Проверка на массив
 * если нужно, чтоб работало в разных фреймах, то
 * нужно сделать через toString(), но будет медленее
 */
var isArray = function(a) { return a instanceof Array; }

/**
 * Ищет свойства в объекте с помощью специального синтаксиса jpath
 * @param {String} path
 * @param {Object}
 * @type Object
 */
var jpath = function(path, json) {
    var parts = jpath.split(path);
    var res = jpath.find(parts.shift(), json);

    while (part = parts.shift()) {
        res = jpath.find(part, res);
    }

    return res;
};

jpath.predicate = function(res, parts) {
    parts.splice(1, 1);     // удаляем =
    var cmp = [];

    for (var i = parts.length; i--; ) {
        var part = parts[i];

        // .foo
        if (/^\./.test(part)) {
            part = part.substr(1);
            if (part in res) {
                cmp.push(res[part]);
            }
        // "some string"
        } else {
            cmp.push(part.substring(1, part.length - 1))
        }
    }

    return cmp.length == 2 && cmp[0] == cmp[1];
};

jpath.find = function(part, res) {

    // искать можно только внутри объектов (Array|Object)
    if (typeof res === 'object') {

        // Предикат
        if (isArray(part)) {

            // если в предикате одно условие [1] или [.foo]
            if (part.length === 1) {

                // в предикате индекс - достать по индексу из массива
                if (/\d+/.test(part)) {
                    part = part - 0;

                    if (isArray(res) && res.length > part) {
                        return res[part];
                    }

                // в предикате селектор - проверить существование селектора
                } else if (/^\./.test(part)) {
                    part = part.substr(1);

                    if (part in res) {
                        return res;
                    }

                }
            // в редикате сравнение [x = y]
            } else {
                if (jpath.predicate(res, part)) {
                    return res;
                }
            }

        // Простой селектор
        } else {
            if (part in res) {
                return res[part];
            }
        }
    }

    return NOT_FOUND;
};

var spString = /("|')([^\1]*)\1/g;
var spNode = /\.([^=.]*)/g;
var spIndex = /(\d+)/g;
var spOp = /(==)/g;

var ops = [
    {
        '!': {
            type: 'unar',
            func: 'not'
        }
    },
    {
        '==': {
            type: 'binar',
            func: 'eq'
        }
    }
];

jpath.split = function(path) {
    console.time(path);

    var part;
    var result = [];
    var parts = path.split(/\.(?![^\[]+\])/).slice(1);
    var placeholder = Array(100).join(' ');
    var carry = function(f, type) {
        return function() {
            return f.apply(null, [type].concat(Array.prototype.slice.apply(arguments)) );
        }
    }

    while (part = parts.shift()) {
        var match = part.match(/([^\[]+)\[([^\]]+)\]/);

        if (match) {
            result.push('node', match[1]);
            var pred = [];
            var repl = function(type, self, match, index, cop) {
                if (typeof cop == 'number') {
                    match = index;
                    index = cop;
                }
                console.log(arguments);
                pred[index] = [type, match];
                return placeholder.substr(0, self.length);
            };

            match[2]
                .replace(spString, carry(repl, 'string'))
                .replace(spNode, carry(repl, 'node'))
                .replace(spIndex, carry(repl, 'index'))
                .replace(spOp, carry(repl, 'op'));

            var predc = [];
            for (var i = 0, l = pred.length; i < l; i++) {
                if (pred[i] != undefined) {
                    predc.push(pred[i]);
                }
            }

            for (var j = 0, i < ops.length; j++) {
                var op = ops[j]
                for (var i = 0, l = predc.length; i < l; i+2) {
                    if (predc[j] === 'op' && predc in op) {
                        if (op[predc[j+1]] == 'unar') {
                            var op1 = predc.splice(i+2, 2);
                            predc.splice(i, 1);
                            predc.splice(i, 0, [op1])
                        }
                    }
                }
            }

            result.push('pred', predc);
        } else {
            result.push('node', part);
        }
    }

    console.timeEnd(path);

    return result;
};

window.jpath = jpath;
})();
