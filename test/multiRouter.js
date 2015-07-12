var assert = require('assert');

describe('Regular object', function(){
	it('should return an _id when object is inserted', function(done) {
		var handlersTouched = [];

		var router = require('./')();
		var router2 = require('./')();

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
			next();
		});

		router.use('/api', router2);

		router.use(function(request, respond, next) {

			console.log("RTR1B", request);
			next();
		});

		router.route('request', '/api/12345', function(error, response) {
			console.log("ER", error, response);
		});

	});
});