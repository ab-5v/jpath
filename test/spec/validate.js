var expect = require('expect.js');
var exec = require('child_process').exec;


describe('--validate', function() {

    var should = function(status) {
        return function(done) {
            exec(__dirname + '/../../bin/jpath --validate "' + this.test.title + '"', function(err, out) {
                expect(out.split(' ')[0]).to.be(status);
                done();
            });
        };
    }

    it('.foo', should('pass'));

    it('.foo[.bar = "1"]', should('fail'));

    it('.foo[bar == "1"]', should('fail'));

    it('.foo[.bar == \'1\']', should('fail'));

});
