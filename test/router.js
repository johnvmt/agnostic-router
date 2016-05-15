var assert = require('assert');

describe('Typical routing', function(){
	it('test regular routing', function(done) {
		var handlersTouched = [];

		var router = require('../')();

		router.use(function(request, respond, next) {
			handlersTouched.push('USE *');
			next();
		});

		router.use('/book22222s', function(request, respond, next) {
			handlersTouched.push('USE /books2222');
			next();
		});

		router.use('/books', function(request, respond, next) {
			handlersTouched.push('USE /books');
			next();
		});

		router.method('request', '/books/mybook', function(request, respond, next) {
			handlersTouched.push("METHOD /books/mybook");
			respond(null, "ok");

		});

		router.route('request', '/books/mybook', {}, function(error, response) {
			console.log(handlersTouched);
			console.log("RESP", error, response);
			done();
		}, function() {
			console.log("END");
			console.log(handlersTouched);
		});
	});
});