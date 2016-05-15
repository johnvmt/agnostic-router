var assert = require('assert');

describe('Multiple routers', function(){
	it('test when one router is mounted on another', function(done) {
		var handlersTouched = [];

		var router = require('../')();
		var router2 = require('../')();

		router.use(function(request, respond, next) {

			console.log("RTR1", request);
			next();
		});

		router2.use(function(request, respond, next) {

			console.log("RTR2", request);
			next();
		});

		router2.method('request', '/12345', function(request, respond, next) {
			console.log("RTR2B", request);
			respond(null, true);
			//next();
		});

		router.use('/api', router2);

		router.use(function(request, respond, next) {

			console.log("RTR1B", request);
			next();
		});

		router.route('request', '/api/12345', function(error, response) {
			console.log("ER", error, response);
			done();
		});

	});
});