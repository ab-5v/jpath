;(function() {

var NOT_FOUND = undefined;

var isArray = function(a) { return a instanceof Array; }

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

jpath.split = function(path) {
    var part;
    var result = [];
    var parts = path.split(/\.(?![^\[]+\])/).slice(1);

    while (part = parts.shift()) {
        var match = part.match(/([^\[]+)\[([^\]]+)\]/);

        if (match) {
            result.push(match[1]);
            result.push(match[2].split(' '));
        } else {
            result.push(part);
        }
    }

    return result;
};

window.jpath = jpath;
})();
