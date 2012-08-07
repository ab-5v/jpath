
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
