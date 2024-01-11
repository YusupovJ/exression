import http from "http";
import nodePath from "path";

function callHadnlersSequentially(handlers, req, res) {
	function executeNext(index) {
		if (index < handlers.length) {
			handlers[index](req, res, function () {
				executeNext(index + 1);
			});
		}
	}

	executeNext(0);
}

const expression = () => {
	const endpoints = {
		GET: {},
		POST: {},
		PATCH: {},
		PUT: {},
		DELETE: {},
		middlewares: {},
	};
	let globalPath = "/";

	const parseUrl = (url, port) => {
		const parsedUrl = new URL(`http://localhost:${port}${url}`);
		return parsedUrl;
	};

	const getQuery = (url) => {
		const query = {};

		url.search.split("&").forEach((property) => {
			const key = property.split("=")[0];
			const value = property.split("=")[1];

			query[key] = value;
		});
		return query;
	};

	const handleEndpoint = (endpoint, url, req, res) => {
		for (const path in endpoints[endpoint]) {
			if (Object.hasOwnProperty.call(endpoints[endpoint], path)) {
				if (url === path) {
					const handlers = endpoints[endpoint][path];

					callHadnlersSequentially(handlers, req, res);
				}
			}
		}
	};

	const connectGlobAndLocPaths = (localPath) => {
		if (globalPath === "/") {
			return globalPath + localPath.slice(1);
		}

		return globalPath + localPath;
	};

	return {
		use(...args) {
			if (typeof args[0] === "string" && typeof args[1] === "function") {
				const path = args[0];

				endpoints.middlewares[connectGlobAndLocPaths(path)] = args.splice(1);
			} else if (typeof args[0] === "string") {
				const path = args[0];

				globalPath = connectGlobAndLocPaths(path);
			} else if (typeof args[0] === "function") {
				endpoints.middlewares[globalPath] = args;
			} else {
				console.error("Incorrect arguments");
			}
		},
		get(path = "/", ...handlers) {
			endpoints.GET[connectGlobAndLocPaths(path.slice(1))] = handlers;
		},
		post(path = "/", ...handlers) {
			endpoints.POST[connectGlobAndLocPaths(path.slice(1))] = handlers;
		},
		put(path = "/", ...handlers) {
			endpoints.PUT[connectGlobAndLocPaths(path.slice(1))] = handlers;
		},
		patch(path = "/", ...handlers) {
			endpoints.PATCH[connectGlobAndLocPaths(path.slice(1))] = handlers;
		},
		delete(path = "/", ...handlers) {
			endpoints.DELETE[connectGlobAndLocPaths(path.slice(1))] = handlers;
		},
		listen(port, callback) {
			const server = http.createServer((req, res) => {
				const url = parseUrl(req.url, port);

				req.query = getQuery(url);

				handleEndpoint("middlewares", url.pathname, req, res);

				if (req.method === "GET") {
					handleEndpoint("GET", url.pathname, req, res);
				}
				if (req.method === "POST") {
					handleEndpoint("POST", url.pathname, req, res);
				}
				if (req.method === "PUT") {
					handleEndpoint("PUT", url.pathname, req, res);
				}
				if (req.method === "PATCH") {
					handleEndpoint("PATCH", url.pathname, req, res);
				}
				if (req.method === "DELETE") {
					handleEndpoint("DELETE", url.pathname, req, res);
				}

				res.end();
			});

			server.listen(port, callback);
		},
	};
};

const app = expression();

app.listen(4000, () => {
	console.log("Server started");
});
