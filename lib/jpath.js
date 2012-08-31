
/**
 * Извлекает из объекта json значение,
 * хранящееся по пути path
 * @param {Object} json
 * @param {String} path
 */
var jpath = function(json, path) {
    var nf = jpath.nf;
    var exec = jpath.exec;

    // проверка типов
    // более подробная проверка есть в exec
    if (json === null || !path || typeof path !== 'string') {
        return [];
    }
    if (path === '.') { return [ json ]; }

    var steps = jpath.split(path);
    var res = exec(json, [steps[0], steps[1]]);

    for (var i = 2, l = steps.length; i < l && res !== nf; i += 2) {
        res = exec(res, [steps[i], steps[i + 1]]);
    }

    // делаем, чтобы jpath всегда возвращал массив,
    // если ничего не найдено, то пустой массив
    if (res === nf) {
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
