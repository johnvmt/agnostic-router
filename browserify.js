// Runs from npm install
var inFile = './src/Router.js';
var outFile = './router.min.js';
var standalone = 'Router';
var mapFile = standalone + '.js.map';

var fs = require('fs');
var browserify = require('browserify');

var b = browserify({standalone: standalone, debug: true});
b.add(inFile);

b.plugin('minifyify', {map: mapFile});

b.bundle(function (err, src, map) {
	fs.writeFileSync(mapFile, map);

	console.log("Out file: ", getFilesizeInBytes(outFile), "bytes");
}).pipe(fs.createWriteStream(outFile));

function getFilesizeInBytes(filename) {
	var stats = fs.statSync(filename);
	var fileSizeInBytes = stats["size"];
	return fileSizeInBytes
}