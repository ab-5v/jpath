
var jpath = function(json, path) {
    var steps = jpath.split(path);
    var res = jpath.exec(json, steps.slice(0, 2));

    for (var i = 2, l = steps.length; i < l && res !== jpath.nf; i += 2) {
        res = jpath.exec(res, steps.slice(i, i + 2));
    }

    if (res === jpath.nf) {
        return [];
    } else if (!jpath.util.isArray(res)) {
        return [res];
    } else {
        return res;
    }
};

/**
 * Что вернёт jpath, когда ничего не найдено
 */
jpath.nf = undefined;
