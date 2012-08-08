if (typeof require == 'function') {
    var jpath = require('../../jpath');
    var expect = require('expect.js');
}

describe('jpath', function() {

    describe('split', function() {

        it('.foo', function() {
            expect(jpath.split('.foo')).to.eql(['node', 'foo']);
        });

        it('/.foo', function() {
            expect(jpath.split('/.foo')).to.eql(['node', 'foo']);
        });

        it('.*', function() {
            expect(jpath.split('.*')).to.eql(['node', '*']);
        });

        it('.foo.bar', function() {
            expect(jpath.split('.foo.bar')).to.eql(['node', 'foo', 'node', 'bar']);
        });

        it('.foo[1]', function() {
            expect(jpath.split('.foo[1]')).to.eql(['node', 'foo', 'predicate', [ 'index', 1 ]]);
        });

        it('.foo[.bar]', function() {
            expect(jpath.split('.foo[.bar]')).to.eql(['node', 'foo', 'predicate', ['node', 'bar']]);
        });

        it('.foo[.bar.loo]', function() {
            expect(jpath.split('.foo[.bar.loo]')).to.eql(['node', 'foo', 'predicate', ['node', ['node', 'bar', 'node', 'loo']]]);
        });

        it('.foo[!.bar]', function() {
            expect(jpath.split('.foo[!.bar]')).to.eql(['node', 'foo', 'predicate', ['not', ['node', 'bar']]]);
        });

        it('.foo[.bar != "k"]', function() {
            expect(jpath.split('.foo[.bar != "k"]')).to.eql(['node', 'foo', 'predicate', ['noteq', ['node', 'bar', 'string', 'k']]]);
        });

        it('.foo[. == "k"]', function() {
            expect(jpath.split('.foo[. == "k"]')).to.eql(['node', 'foo', 'predicate', ['eq', ['node', '', 'string', 'k']]]);
        });

        it('.foo[.bar == "k"]', function() {
            expect(jpath.split('.foo[.bar == "k"]')).to.eql(['node', 'foo', 'predicate', ['eq', ['node', 'bar', 'string', 'k']]]);
        });

        it('.foo[1].bar', function() {
            expect(jpath.split('.foo[1].bar')).to.eql(['node', 'foo', 'predicate', ['index', 1], 'node', 'bar']);
        });

        it('.c.d[.e == "3"].d[1]', function() {
            expect(jpath.split('.c.d[.e == "3"].d[1]')).to.eql(['node', 'c', 'node', 'd', 'predicate', ['eq', ['node', 'e', 'string', '3']], 'node', 'd', 'predicate', ['index', 1]]);
        });

        it('.foo[!.bar && !.loo]', function() {
            expect(jpath.split('.foo[!.bar && !.loo]'))
                .to.eql(['node', 'foo', 'predicate', ['and', ['not', ['node', 'bar'], 'not', ['node', 'loo']]]]);
        });

        it('.foo[.bar == "k" || .loo != "m"]', function() {
            expect(jpath.split('.foo[.bar == "k" || .loo != "mmm"]'))
                .to.eql(['node', 'foo', 'predicate', ['or', ['eq', ['node', 'bar', 'string', 'k'], 'noteq', ['node', 'loo', 'string', 'mmm']]]]);
        });

    });

    describe('exotic', function() {
        var json = {
            'a': {
                'a-b': 1,
                '1': 2,
                'undefined': 3,
                '0': 4,
                'some': '',
                'somef': false
            }
        };

        it('.a.a-b +', function() {
            expect(jpath(json, '.a.a-b')).to.eql([1]);
        });

        it('.a.1 +', function() {
            expect(jpath(json, '.a.1')).to.eql([2]);
        });

        it('.a.undefined +', function() {
            expect(jpath(json, '.a.undefined')).to.eql([3]);
        });

        it('.a.0 +', function() {
            expect(jpath(json, '.a.0')).to.eql([4]);
        });

        it('.a[.a-b == "1"].1 +', function() {
            expect(jpath(json, '.a[.a-b == "1"].1')).to.eql([2]);
        });

        it('.a[.a-b == "2"] -', function() {
            expect(jpath(json, '.a[.a-b == "2"]')).to.eql([]);
        });

        it('.a[.1 == "2"].1 +', function() {
            expect(jpath(json, '.a[.1 == "2"].1')).to.eql([2]);
        });

        it('.a[.0 == "4"] +', function() {
            expect(jpath(json, '.a[.1 == "2"]')).to.eql([json.a]);
        });

        it('.a[.undefined].1 +', function() {
            expect(jpath(json, '.a[.undefined].1')).to.eql([2]);
        });

        it('.a[.b-a].undefined +', function() {
            expect(jpath(json, '.a[.b-a].undefined')).to.eql([]);
        });

        it('.a.some +', function() {
            expect(jpath(json, '.a.some')).to.eql(['']);
        });

        it('.a.somef +', function() {
            expect(jpath(json, '.a.somef')).to.eql([false]);
        });

        it('.foo.bar in undefined', function() {
            expect(jpath(undefined, '.foo.bar')).to.eql([]);
        });

        it('.foo.bar in null', function() {
            expect(jpath(null, '.foo.bar')).to.eql([]);
        });

        it('.foo.bar in empty', function() {
            expect(jpath('', '.foo.bar')).to.eql([]);
        });

        it('.foo.bar in not empty string', function() {
            expect(jpath('foo', '.foo.bar')).to.eql([]);
        });

        it('.foo.bar in number', function() {
            expect(jpath(123, '.foo.bar')).to.eql([]);
        });

        it('empty string in some object', function() {
            expect(jpath(json, '')).to.eql([]);
        });

        it('udefined in some object', function() {
            expect(jpath(json, undefined)).to.eql([]);
        });

        it('null in some object', function() {
            expect(jpath(json, null)).to.eql([]);
        });

        it('number in some object', function() {
            expect(jpath(json, 123)).to.eql([]);
        });

        it('object in some object', function() {
            expect(jpath(json, {foo: 'bar'})).to.eql([]);
        });

        it('.', function() {
            expect(jpath(json, '.')).to.eql([json]);
        });
    });

    describe('full', function() {
        var json = {
            a: 1,
            b: "2",
            c: {
                d: {
                    e: 3,
                    d: [4, 5, 6, 7]
                },
                n: [
                    {
                        a: 8,
                        b: 9
                    },
                    {
                        c: 10,
                        d: {
                            l: 11
                        }
                    }
                ],
                ea: [],
                f: false,
                u: undefined,
                nu: null
            }
        };

        it('.a +', function() {
            expect(jpath(json, '.a')).to.eql([1]);
        });

        it('.a[. == "1"] +', function() {
            expect(jpath(json, '.a[. == "1"]')).to.eql([1]);
        });

        it('.a[. == "2"] -', function() {
            expect(jpath(json, '.a[. == "2"]')).to.eql([]);
        });

        it('.[.b == "2"]', function() {
            expect(jpath(json, '.[.b == "2"]')).to.eql([json]);
        });

        it('.c.d.e +', function() {
            expect(jpath(json, '.c.d.e')).to.eql([3]);
        });

        it('.c[.f].d.e -', function() {
            expect(jpath(json, '.c[.f].d.e')).to.eql([]);
        });

        it('.c[.u].d.e -', function() {
            expect(jpath(json, '.c[.u].d.e')).to.eql([]);
        });

        it('.c[.nu].d.e -', function() {
            expect(jpath(json, '.c[.nu].d.e')).to.eql([]);
        });

        it('.c[.ea].d.e -', function() {
            expect(jpath(json, '.c[.nu].d.e')).to.eql([]);
        });

        it('.c[.n].d.e +', function() {
            expect(jpath(json, '.c[.n].d.e')).to.eql([3]);
        });

        it('.c[.d].d.e +', function() {
            expect(jpath(json, '.c[.n].d.e')).to.eql([3]);
        });

        it('.c.m -', function() {
            expect(jpath(json, '.a.c.m')).to.eql([]);
        });

        it('.c.d.d[2] +', function() {
            expect(jpath(json, '.c.d.d[2]')).to.eql([6]);
        });

        it('.c.n[1].d +', function() {
            expect(jpath(json, '.c.n[1].d')).to.eql([{l: 11}]);
        });

        it('.c.d[.e == "3"].d[1] +', function() {
            expect(jpath(json, '.c.d[.e == "3"].d[1]')).to.eql([5]);
        });

        it('.c.d[.e == "5"] -', function() {
            expect(jpath(json, '.c.d[.e == "5"]')).to.eql([]);
        });

        it('.c.d[!.e] +', function() {
            expect(jpath(json, '.c.d[!.e]')).to.eql([]);
        });

        it('.c.d[!.c && .e].d[1] +', function() {
            expect(jpath(json, '.c.d[!.c && .e].d[1]')).to.eql([5]);
        });

        it('.c.d[.e == "5" || .e == "3"].d[1] +', function() {
            expect(jpath(json, '.c.d[.e == "5" || .e == "3"].d[1]')).to.eql([5]);
        });

        it('.c.d[.e == "5" && .e == "3"].d[1] -', function() {
            expect(jpath(json, '.c.d[.e == "5" && .e == "3"].d[1]')).to.eql([]);
        });

        it('.c.d.d[. == "5"] +', function() {
            expect(jpath(json, '.c.d.d[. == "5"]')).to.eql([ 5 ]);
        });

        it('.c.d.d[. == "5"] + caching', function() {
            var caching = jpath.caching;
            jpath.caching = true;
            for (var i = 5; i--;) {
                expect(jpath(json, '.c.d.d[. == "5"]')).to.eql([ 5 ]);
            }
            jpath.caching = caching;
        });
    });

    describe('multiple', function() {
        var json = {
            m: [
                {
                    a: 1,
                    b: 2
                },
                {
                    a: 3,
                    b: 4
                },
                {
                    a: 1,
                    b: 6
                }
            ]
        };

        it('.m[1] +', function() {
            expect(jpath(json, '.m[1]')).to.eql([{a: 3, b: 4}]);
        });

        it('.m[.a == "1"] +', function() {
            expect(jpath(json, '.m[.a == "1"]')).to.eql([{a: 1, b: 2}, {a: 1, b: 6}]);
        });

        it('.m[.a == "1"].b +', function() {
            expect(jpath(json, '.m[.a == "1"].b')).to.eql([2, 6]);
        });

        it('.* +', function() {
            expect(jpath(json, '.*')).to.eql([json.m]);
        });

        it('.m[0].* +', function() {
            expect(jpath(json, '.m[0].*')).to.eql([1, 2]);
        });

        it('.m.* +', function() {
            expect(jpath(json, '.m.*')).to.eql([[1, 2], [3, 4], [1, 6]]);
        });

        it('.*.* +', function() {
            expect(jpath(json, '.*.*')).to.eql([[[1, 2], [3, 4], [1, 6]]]);
        });

    });

    describe('raw array', function() {
        var json = [
            {
                a: 1,
                b: 2
            },
            {
                a: 3,
                b: 4,
                c: 5
            },
            {
                a: 1,
                b: 6
            }
        ];

        it('.[.a == "3"]', function() {
            expect(jpath(json, '.[.a == "3"]')).to.eql([{a: 3, b: 4, c: 5}]);
        });

        it('.[.a == "1"]', function() {
            expect(jpath(json, '.[.a == "1"]')).to.eql([{a: 1, b: 2}, {a: 1, b: 6}]);
        });

        it('.[.c]', function() {
            expect(jpath(json, '.[.c]')).to.eql([{a: 3, b: 4, c: 5}]);
        });

    });

    describe('real life', function() {
        var json = {
            handlers: [
                {
                    name: 'messages',
                    data: {
                        message: {
                            id: "123",
                            some: "324"
                        }
                    }
                },
                {
                    name: 'folders',
                    data: {
                        folder: []
                    }
                },
                {
                    name: 'settings',
                    data: {
                        prop1: 'on',
                        prop2: '',
                        prop3: 'on',
                        prop4: ''
                    }
                }
            ]
        };

        it('/.handlers[.name == "message"].data.message.id', function() {
            expect(jpath(json, '/.handlers[.name == "messages"].data.message.id')).to.eql(["123"]);
        });

        it('/.handlers.name', function() {
            expect(jpath(json, '/.handlers.name')).to.eql(['messages', 'folders', 'settings']);
        });

        it('/.handlers[0].data.message.*', function() {
            expect(jpath(json, '/.handlers[0].data.message.*')).to.eql(['123', '324']);
        });

        it('/.handlers[.name == "settings"].data.prop3[. == "on"]', function() {
            expect(jpath(json, '/.handlers[.name == "settings"].data.prop3[. == "on"]')).to.eql(['on']);
        });

        it('/.handlers[.name == "settings"].data.prop4[. == "on"]', function() {
            expect(jpath(json, '/.handlers[.name == "settings"].data.prop4[. == "on"]')).to.eql([]);
        });

        it('/.handlers[.name == "settings"].data.prop2[. != "on"]', function() {
            expect(jpath(json, '/.handlers[.name == "settings"].data.prop2[. != "on"]')).to.eql(['']);
        });

        it('/.handlers[.name == "settings"].data.prop3[. != "on"]', function() {
            expect(jpath(json, '/.handlers[.name == "settings"].data.prop3[. != "on"]')).to.eql([]);
        });

    });

    describe('cmp arrays', function() {
        var json = {
            a: [
                { b: [1,2,3], c: [2,4,5] },
                { b: [] },
                { b: [4, 5, 6], d: [7, 8, 9]}
            ]
        }

        it('.a[!.b] +', function() {
            expect(jpath(json, '.a[!.b]')).to.eql([{b: []}]);
        });

        it('.a[.b] +', function() {
            expect(jpath(json, '.a[.b]')).to.eql([{b: [1, 2, 3], c: [2, 4, 5]}, { b: [4, 5, 6], d: [7, 8, 9]}]);
        });

        it('.a[.b == "1"] +', function() {
            expect(jpath(json, '.a[.b == "1"]')).to.eql([{b: [1, 2, 3], c: [2, 4, 5]}]);
        });

        it('.a[.b == "7"] -', function() {
            expect(jpath(json, '.a[.b == "7"]')).to.eql([]);
        });

        it('.a["1" == .b] +', function() {
            expect(jpath(json, '.a["1" == .b]')).to.eql([{b: [1, 2, 3], c: [2, 4, 5]}]);
        });

        it('.a[.c == .b] +', function() {
            expect(jpath(json, '.a[.c == .b]')).to.eql([{b: [1, 2, 3], c: [2, 4, 5]}]);
        });

        it('.a[.b != .c] +', function() {
            expect(jpath(json, '.a[.c != .b]')).to.eql([{b: []}, {b: [4, 5, 6], d: [7, 8, 9]}]);
        });
    });

    describe('deep select', function() {
        var json1 = {
            a: [
                {b: {c: 1}, d: 4, n: {m: 1}},
                {b: {c: 2}, d: 5, n: {m: 2}},
                {b: {c: 3}, d: 6, n: {m: 4}},
            ]
        };

        var json2 = {
            a: { b: {c: 1}, e: {f: 1}, r: 8},
            d: { b: {c: 2}, e: {f: 1}, r: 9}
        };

        it('.a[.b.c == "1"].d +', function() {
            expect(jpath(json1, '.a[.b.c == "1"].d')).to.eql([4]);
        });

        it('.a[.b.c == "3"].d +', function() {
            expect(jpath(json1, '.a[.b.c == "3"].d')).to.eql([6]);
        });

        it('.a[.b.c == "5"].d -', function() {
            expect(jpath(json1, '.a[.b.c == "5"].d')).to.eql([]);
        });

        it('.a[.b.c == .n.m].d +', function() {
            expect(jpath(json1, '.a[.b.c == .n.m].d')).to.eql([4, 5]);
        });

        it('.a[.b.c != .n.m].d +', function() {
            expect(jpath(json1, '.a[.b.c != .n.m].d')).to.eql([6]);
        });

        it('.a[.b.c == "1"].r +', function() {
            expect(jpath(json2, '.a[.b.c == "1"].r')).to.eql([8]);
        });

        it('.a[.b.c == .e.f].r +', function() {
            expect(jpath(json2, '.a[.b.c == .e.f].r')).to.eql([8]);
        });

        it('.d[.b.c != .e.f].r +', function() {
            expect(jpath(json2, '.d[.b.c != .e.f].r')).to.eql([9]);
        });
    });
});
