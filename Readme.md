=Agnostic Router=
Route without Express and friends

==Installation==

===Bower===
	
	bower install

===Node===

	npm install

==Usage==
Load in Node.js:

	var router = require('agnostic-router')();
	
Load in browser:

	var router = new Router();

	router.use(function(request, respond, next) {
		console.log("All requests will pass through here");
		next();
	});

	router.use('/papers', function(request, respond, next) {
		console.log("This should not be triggered at all");
		next();
	});

	router.use('/books', function(request, respond, next) {
		console.log("All requests under /books will pass through here");
		next();
	});

	router.method('request', '/books/mybook', function(request, respond, next) {
		console.log("Requests to /books/mybook will pass through here");
		respond(null, "ok");
	});

	router.route('request', '/books/mybook', {}, function(error, response) {
		console.log("RESPONSE", error, response);
	}, function() {
		console.log("This will be triggered if none of the routers are triggered");
	});

==Testing==

	mocha test/*
