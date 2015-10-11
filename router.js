if (typeof window === "object") { // Browser

}
else if (typeof process === "object") { // Node.js
	module.exports = function() {
		return new Router();
	};
}

function Router() {
	this.useRoutes = [];
	this.methodRoutes = {};
	this.index = 0;

	this._required = {
		'UrlPattern': {
			node: "url-pattern",
			browser: "./bower_components/url-pattern/lib/url-pattern.js",
			windowVar: "UrlPattern"
		}
	}
}

Router.prototype.route = function() {
	// takes method, path, [request], respond
	if(arguments.length == 3) {
		var request = {};
		var respond = arguments[2];
	}
	else if(arguments.length >= 4) {
		var request = arguments[2];
		if(typeof request !== "object" || !request)
			request = {};
		var respond = arguments[3];
	}
	request.method = arguments[0];

	var path = arguments[1];
	if(typeof request.path === 'undefined') // only overwrite path if doesn't already exist (carries through all routers)
		request.path = path;

	var queueEnd = arguments[4];

	var self = this;
	this._require('UrlPattern', function(UrlPattern) {
		self.UrlPattern = UrlPattern; // Add UrlPattern for use in _methodPathMatches
		var routeMatches = self._methodPathMatches(request.method, path);
		queueNext();

		function queueNext() {
			var routeMatch = routeMatches.shift();
			if(typeof routeMatch !== "undefined") {
				request.params = routeMatch.params; // overwrite params on each new route match
				if(typeof routeMatch.handler === "function")
					routeMatch.handler(request, respond, queueNext);
				else if(Router._isRouter(routeMatch.handler))
					routeMatch.handler.route(request.method, '/' + request.params['_'], request, respond, queueNext); // cycle through the router, then rejoin the queue
				else // route handler isn't a function or a router
					queueNext();
			}
			else if(typeof queueEnd === 'function') // reached the end of the queue
				queueEnd();
		}
	});
};

Router.prototype.use = function() {
	// [path], handler
	var path = (typeof arguments[0] === 'string') ? arguments[0] : '';
	var handler = Router._validHandler(arguments[0]) ? arguments[0] : arguments[1];

	return this._addRouteToArray(this.useRoutes, Router._normalizePath(path), handler);
};

Router.prototype.useFirst = function() {
	// [path], handler
	var path = (typeof arguments[0] === 'string') ? arguments[0] : '';
	var handler = Router._validHandler(arguments[0]) ? arguments[0] : arguments[1];

	return this._addRouteToArray(this.useRoutes, Router._normalizePath(path), handler, true);
};

Router.prototype.method = function(method, path, handler) {
	if(!(this.methodRoutes[method] instanceof Array)) // create the stack if it doesn't exist
		this.methodRoutes[method] = [];
	return this._addRouteToArray(this.methodRoutes[method], Router._normalizePath(path), handler);
};

/* Private functions */
Router._validHandler = function(handler) {
	return (typeof handler === 'function' || Router._isRouter(handler)); // must be function or router
};

Router._isRouter = function(handler) {
	return (typeof handler === 'object' && typeof handler.route === 'function'); // must be function or router
};

Router._normalizePath = function(path) {
	return path.replace(/\/$/, ''); // strip trailing slash
};

Router.prototype._methodPathMatches = function(method, path) {
	var pathNormalized = Router._normalizePath(path);
	var matches = [];
	var self = this;

	self.useRoutes.forEach(function(route) {
		var routeMatch = (new self.UrlPattern(route.path + '(/*)')).match(pathNormalized);
		//console.log("RU", routeMatch, route.path, pathNormalized);
		if(routeMatch !== null)
			matches.push({path: route.path, handler: route.handler, params: routeMatch});
	});

	if(self.methodRoutes[method] instanceof Array) {
		self.methodRoutes[method].forEach(function(route) {
			var routeMatch = (new self.UrlPattern(route.path)).match(pathNormalized);
			//console.log("RM", route.path, pathNormalized, routeMatch);
			if(routeMatch !== null)
				matches.push({path: route.path, handler: route.handler, params: routeMatch});
		});
	}

	return matches;
};

Router.prototype._addRouteToArray = function(array, path, handler, prepend) {
	var route = {path: path, handler: handler};
	if(typeof prepend === 'boolean') //prepend
		array.unshift(route);
	else //append
		array.push(route);
};

Router.prototype._require = function(key, callback) {
	// Asynchronous require that works with browser and Node.js
	if(typeof this._required[key] === 'object') {
		var pkg = this._required[key];
		if (typeof window === "object") { // Browser
			if(typeof window[pkg['windowVar']] !== 'undefined')
				callback(window[pkg['windowVar']]);
			else {
				if(Array.isArray(pkg['onload'])) // load in progress
					pkg['onload'].push(callback);
				else {
					pkg['onload'] = [callback];
					loadScript(pkg['browser'], function () { // trigger all callbacks
						pkg['onload'].forEach(function(callback) {
							callback(window[pkg['windowVar']]);
						});
					});
				}
			}
		}
		else if (typeof process === "object") // Node.js
			callback(require(pkg['node']));
	}
	else
		console.error(key + ' not found');

	function loadScript(url, callback) {
		// From http://stackoverflow.com/questions/16041884/how-to-include-js-from-js-using-ie8
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;

		if(!callback) callback = function(){};

		if(script.addEventListener) { // bind the event to the callback function
			script.addEventListener("load", callback, false); // IE9+, Chrome, Firefox
		}
		else if(script.readyState) {
			script.onreadystatechange = callback; // IE8
		}
		head.appendChild(script); // fire the loading
	}
};
