var assert = require('assert');

describe('Regular object', function(){
	it('should return an _id when object is inserted', function(done) {
		var handlersTouched = [];

		var router = require('../')();

		router.use('', function(request, respond, next) {
			handlersTouched.push('');
			next();
		});

		router.use('/books/*section/', function(request, respond, next) {
			handlersTouched.push('/books/*section/');
			next();
		});

		router.use('/books/*section/:title/', function(request, respond, next) {
			console.log("HANDLER2");
			respond("ERR", "RESPONSE");
			next();
		});

		router.use('/books', function(request, respond, next) {
			console.log("HANDLER3");
			next();
		});

		router.use('/books/mysection', function(request, respond, next) {
			console.log("HANDLER4");
			next();
		});

		router.route('request', '/boobs/mysection/mytitle/2', {}, function(error, response) {

			console.log("RESP", error, response);
		});
	});
});