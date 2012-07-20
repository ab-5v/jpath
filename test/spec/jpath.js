describe('jpath', function() {

    describe('split', function() {

        it('.foo', function() {
            expect(jpath.split('.foo')).toEqual(['node', 'foo']);
        });

        it('/.foo', function() {
            expect(jpath.split('/.foo')).toEqual(['node', 'foo']);
        });

        it('.foo.bar', function() {
            expect(jpath.split('.foo.bar')).toEqual(['node', 'foo', 'node', 'bar']);
        });

        it('.foo[1]', function() {
            expect(jpath.split('.foo[1]')).toEqual(['node', 'foo', 'predicate', [ 'index', 1 ]]);
        });

        it('.foo[.bar]', function() {
            expect(jpath.split('.foo[.bar]')).toEqual(['node', 'foo', 'predicate', ['node', 'bar']]);
        });

        it('.foo[.bar.loo]', function() {
            expect(jpath.split('.foo[.bar.loo]')).toEqual(['node', 'foo', 'predicate', ['node', ['node', 'bar', 'node', 'loo']]]);
        });

        it('.foo[!.bar]', function() {
            expect(jpath.split('.foo[!.bar]')).toEqual(['node', 'foo', 'predicate', ['not', ['node', 'bar']]]);
        });

        it('.foo[.bar != "k"]', function() {
            expect(jpath.split('.foo[.bar != "k"]')).toEqual(['node', 'foo', 'predicate', ['noteq', ['node', 'bar', 'string', 'k']]]);
        });

        it('.foo[.bar == "k"]', function() {
            expect(jpath.split('.foo[.bar == "k"]')).toEqual(['node', 'foo', 'predicate', ['eq', ['node', 'bar', 'string', 'k']]]);
        });

        it('.foo[1].bar', function() {
            expect(jpath.split('.foo[1].bar')).toEqual(['node', 'foo', 'predicate', ['index', 1], 'node', 'bar']);
        });

        it('.c.d[.e == "3"].d[1]', function() {
            expect(jpath.split('.c.d[.e == "3"].d[1]')).toEqual(['node', 'c', 'node', 'd', 'predicate', ['eq', ['node', 'e', 'string', '3']], 'node', 'd', 'predicate', ['index', 1]]);
        });

        it('.foo[!.bar && !.loo]', function() {
            expect(jpath.split('.foo[!.bar && !.loo]'))
                .toEqual(['node', 'foo', 'predicate', ['and', ['not', ['node', 'bar'], 'not', ['node', 'loo']]]]);
        });

        it('.foo[.bar == "k" || .loo != "m"]', function() {
            expect(jpath.split('.foo[.bar == "k" || .loo != "mmm"]'))
                .toEqual(['node', 'foo', 'predicate', ['or', ['eq', ['node', 'bar', 'string', 'k'], 'noteq', ['node', 'loo', 'string', 'mmm']]]]);
        });

    });

    describe('exotic', function() {
        var json = {
            'a': {
                'a-b': 1,
                '1': 2,
                'undefined': 3,
                '0': 4
            }
        };

        it('.a.a-b +', function() {
            expect(jpath(json, '.a.a-b')).toEqual([1]);
        });

        it('.a.1 +', function() {
            expect(jpath(json, '.a.1')).toEqual([2]);
        });

        it('.a.undefined +', function() {
            expect(jpath(json, '.a.undefined')).toEqual([3]);
        });

        it('.a.0 +', function() {
            expect(jpath(json, '.a.0')).toEqual([4]);
        });

        it('.a[.a-b == \'1\'].1 +', function() {
            expect(jpath(json, '.a[.a-b == \'1\'].1')).toEqual([2]);
        });

        it('.a[.a-b == \'2\'] -', function() {
            expect(jpath(json, '.a[.a-b == "2"]')).toEqual([]);
        });

        it('.a[.1 == "2"].1 +', function() {
            expect(jpath(json, '.a[.1 == "2"].1')).toEqual([2]);
        });

        it('.a[.0 == "4"] +', function() {
            expect(jpath(json, '.a[.1 == "2"]')).toEqual([json.a]);
        });

        it('.a[.undefined].1 +', function() {
            expect(jpath(json, '.a[.undefined].1')).toEqual([2]);
        });

        it('.a[.b-a].undefined +', function() {
            expect(jpath(json, '.a[.b-a].undefined')).toEqual([]);
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
                f: false
            }
        };

        it('.a +', function() {
            expect(jpath(json, '.a')).toEqual([1]);
        });

        it('.c.d.e +', function() {
            expect(jpath(json, '.c.d.e')).toEqual([3]);
        });

        it('.c[.f].d.e +', function() {
            expect(jpath(json, '.c[.f].d.e')).toEqual([3]);
        });

        it('.c.m -', function() {
            expect(jpath(json, '.a.c.m')).toEqual([]);
        });

        it('.c.d.d[2] +', function() {
            expect(jpath(json, '.c.d.d[2]')).toEqual([6]);
        });

        it('.c.n[1].d +', function() {
            expect(jpath(json, '.c.n[1].d')).toEqual([{l: 11}]);
        });

        it('.c.d[.e == "3"].d[1] +', function() {
            expect(jpath(json, '.c.d[.e == "3"].d[1]')).toEqual([5]);
        });

        it('.c.d[.e == "5"] -', function() {
            expect(jpath(json, '.c.d[.e == "5"]')).toEqual([]);
        });

        it('.c.d[!.e] +', function() {
            expect(jpath(json, '.c.d[!.e]')).toEqual([]);
        });

        it('.c.d[!.c && .e].d[1] +', function() {
            expect(jpath(json, '.c.d[!.c && .e].d[1]')).toEqual([5]);
        });

        it('.c.d[.e == "5" || .e == "3"].d[1] +', function() {
            expect(jpath(json, '.c.d[.e == "5" || .e == "3"].d[1]')).toEqual([5]);
        });

        it('.c.d[.e == "5" && .e == "3"].d[1] -', function() {
            expect(jpath(json, '.c.d[.e == "5" && .e == "3"].d[1]')).toEqual([]);
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

        it('.m[1]', function() {
            expect(jpath(json, '.m[1]')).toEqual([{a: 3, b: 4}]);
        });

        it('.m[.a == "1"]', function() {
            expect(jpath(json, '.m[.a == "1"]')).toEqual([{a: 1, b: 2}, {a: 1, b: 6}]);
        });

        it('.m[.a == "1"].b', function() {
            expect(jpath(json, '.m[.a == "1"].b')).toEqual([2, 6]);
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
                }
            ]
        };

        it('/.handlers[.name == "message"].data.message.id', function() {
            expect(jpath(json, '/.handlers[.name == "messages"].data.message.id')).toEqual(["123"]);
        });

    });

});
