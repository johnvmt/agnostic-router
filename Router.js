var RouteParser = require('route-parser');

function Router() {
	this.useRoutes = [];
	this.methodRoutes = {};
	this.index = 0;
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

	var routeMatches = this._methodPathMatches(request.method, path);
	queueNext();

	function queueNext() {
		var routeMatch = routeMatches.shift();
		if(typeof routeMatch !== "undefined") {
			request.params = routeMatch.params; // overwrite params on each new route match
			if(typeof routeMatch.handler === "function")
				routeMatch.handler(request, respond, queueNext);
			else if(routeMatch.handler instanceof Router)
				routeMatch.handler.route(request.method, '/' + request.params['_'], request, respond, queueNext); // cycle through the router, then rejoin the queue
			else // route handler isn't a function or a router
				queueNext();
		}
		else if(typeof queueEnd === 'function') // reached the end of the queue
			queueEnd();
	}
};

Router.prototype.use = function() {
	// [path], handler
	var path = (typeof arguments[0] === 'string') ? arguments[0] : '';
	var handler = (typeof arguments[0] === 'function' || arguments[0] instanceof Router) ? arguments[0] : arguments[1];

	return this._addRouteToArray(this.useRoutes, this._normalizePath(path), handler);
};

Router.prototype.useFirst = function() {
	// [path], handler
	var path = (typeof arguments[0] === 'string') ? arguments[0] : '';
	var handler = (typeof arguments[0] === 'function' || arguments[0] instanceof Router) ? arguments[0] : arguments[1];

	return this._addRouteToArray(this.useRoutes, this._normalizePath(path), handler, true);
};

Router.prototype.method = function(method, path, handler) {
	if(!(this.methodRoutes[method] instanceof Array)) // create the stack if it doesn't exist
		this.methodRoutes[method] = [];
	return this._addRouteToArray(this.methodRoutes[method], this._normalizePath(path), handler);
};

/* Private functions */
Router.prototype._methodPathMatches = function(method, path) {
	var pathNormalized = this._normalizePath(path);
	var matches = [];

	this.useRoutes.forEach(function(route) {
		var routeMatch = (new RouteParser(route.path + '(/*_)')).match(pathNormalized);
		if(routeMatch !== false)
			matches.push({path: route.path, handler: route.handler, params: routeMatch});
	});

	if(this.methodRoutes[method] instanceof Array) {
		this.methodRoutes[method].forEach(function(route) {
			var routeMatch = (new RouteParser(route.path)).match(pathNormalized);
			if(routeMatch !== false)
				matches.push({path: route.path, handler: route.handler, params: routeMatch});
		});
	}

	return matches;
};

Router.prototype._normalizePath = function(path) {
	return path.replace(/\/$/, ''); // strip trailing slash
};

Router.prototype._addRouteToArray = function(array, path, handler, prepend) {
	if(typeof prepend === 'boolean') //prepend
		array.unshift({path: path, handler: handler});
	else //append
		array.push({path: path, handler: handler});
};

module.exports = function() {
	return new Router();
};