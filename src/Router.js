var UrlPattern = require('url-pattern');

function Router(options) {
	this.options = (typeof options == 'object') ? options : {};
	this.useRoutes = [];
	this.methodRoutes = {};
	this.index = 0;
	this.UrlPattern = UrlPattern;
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
			else if(Router._isRouter(routeMatch.handler))
				routeMatch.handler.route(request.method, '/' + request.params['_'], request, respond, queueNext); // cycle through the router, then rejoin the queue
			else // route handler isn't a function or a router
				queueNext();
		}
		else if(typeof queueEnd === 'function') // reached the end of the queue
			queueEnd();
	}

};

Router.prototype.path = function(path, params) {
	// path, [params]
	if(typeof params != 'object' || params == null)
		params = {};

	return (new UrlPattern(path + '(/*)', this.options)).stringify(params)
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
		var routeMatch = (new UrlPattern(route.path + '(/*)', self.options)).match(pathNormalized);
		//console.log("RU", routeMatch, route.path, pathNormalized);
		if(routeMatch !== null)
			matches.push({path: route.path, handler: route.handler, params: routeMatch});
	});

	if(self.methodRoutes[method] instanceof Array) {
		self.methodRoutes[method].forEach(function(route) {
			var routeMatch = (new UrlPattern(route.path, self.options)).match(pathNormalized);
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

module.exports = function(options) {
	return new Router(options);
};
