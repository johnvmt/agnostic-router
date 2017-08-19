var assert = require('assert');

describe('Path building', function(){
	it('path with parameters', function(done) {
		var router = require('../')();

		var generated = router.path('/books/:category/:title', {category: 'mycategory', title: 'mytitle'});

		if(generated == '/books/mycategory/mytitle')
			done();
		else
			throw new Error('Incorrect generated path', generated);
	});

	it('path with missing parameters', function(done) {
		var router = require('../')();

		try {
			var generated = router.path('/books/:category/:title', {category: 'mycategory'});
			throw new Error("Missing parameter error not triggered");
		}
		catch(error) {
			if(error.message == 'no values provided for key `title`')
				done();
			else
				throw error;
		}


	});

	it('path with no parameters', function(done) {
		var router = require('../')();

		var generated = router.path('/books');

		if(generated == '/books')
			done();
		else
			throw new Error('Incorrect generated path', generated);
	});
});