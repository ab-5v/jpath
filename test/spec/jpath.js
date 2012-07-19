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

    return;
    describe('find', function() {

        it('.foo +', function() {
            expect( jpath.find('foo', {foo: 1}) ).toBe(1);
        });

        it('.foo -', function() {
            expect( jpath.find('foo', {bar: 1}) ).toBe(undefined);
        });

        it('[1] +', function() {
            expect( jpath.find(['1'], ['a', 'b']) ).toBe('b');
        });

        it('[1] -', function() {
            expect( jpath.find(['1'], {foo: 1}) ).toBe(undefined);
        });

        it('[.bar == "1"] +', function() {
            expect( jpath.find(['.bar', '==', '"1"'], {bar: "1"}) ).toEqual({bar: "1"});
        });

        it('[.bar == "2"] -', function() {
            expect( jpath.find(['.bar', '==', '"2"'], {bar: "1"}) ).toEqual(undefined);
        });

        it('["1" == .bar] +', function() {
            expect( jpath.find(['.bar', '==', '"1"'], {bar: "1"}) ).toEqual({bar: "1"});
        });

        it('["2" == .bar] -', function() {
            expect( jpath.find(['.bar', '==', '"2"'], {bar: "1"}) ).toEqual(undefined);
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
                ]
            }
        };

        it('.a +', function() {
            expect(jpath('.a', json)).toEqual(1);
        });

        it('.c.d.e +', function() {
            expect(jpath('.c.d.e', json)).toEqual(3);
        });

        it('.c.m -', function() {
            expect(jpath('.a.c.m', json)).toEqual(undefined);
        });

        it('.c.d.d[2] +', function() {
            expect(jpath('.c.d.d[2]', json)).toEqual(6);
        });

        it('.c.n[1].d +', function() {
            expect(jpath('.c.n[1].d', json)).toEqual({l: 11});
        });

        it('.c.d[.e == "3"].d[1] +', function() {
            expect(jpath('.c.d[.e == "3"].d[1]', json)).toEqual(5);
        });

        it('.c.d[.e == "5"] -', function() {
            expect(jpath('.c.d[.e == "5"]', json)).toEqual(undefined);
        });

    });

});
