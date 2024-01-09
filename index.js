import http from "http";
import nodePath from "path";

const expression = () => {
	const endpoints = {
		getHandlers: {},
		postHandlers: {},
		patchHandlers: {},
		putHandlers: {},
		deleteHandlers: {},
	};
	let globalPath = "/";
	let middlewares = [];

	const parseUrl = (url, port) => {
		const parsedUrl = new URL(`http://localhost:${port}${url}`);
		return parsedUrl;
	};

	const getQuery = (url) => {
		const query = {};

		url.search
			.slice(1)
			.split("&")
			.forEach((property) => {
				const key = property.split("=")[0];
				const value = property.split("=")[1];

				query[key] = value;
			});
		return query;
	};

	const handleEndpoint = (handler, url, req, res) => {
		for (const path in endpoints[handler]) {
			if (Object.hasOwnProperty.call(endpoints[handler], path)) {
				if (url === path) {
					const handlers = endpoints[handler][path];

					handlers[0](req, res, () => {
						handlers[1](req, res);
					});
				}
			}
		}
	};

	return {
		use(...args) {
			if (typeof args[0] === "string" && typeof args[1] === "function") {
			} else if (typeof args[0] === "string") {
			} else if (typeof args[0] === "function") {
			}
		},
		get(path = "/", ...handlers) {
			endpoints.getHandlers[path] = handlers;
		},
		post(path = "/", ...handlers) {
			endpoints.postHandlers[path] = handlers;
		},
		put(path = "/", ...handlers) {
			endpoints.putHandlers[path] = handlers;
		},
		patch(path = "/", ...handlers) {
			endpoints.patchHandlers[path] = handlers;
		},
		delete(path = "/", ...handlers) {
			endpoints.deleteHandlers[path] = handlers;
		},
		listen(port, callback) {
			const server = http.createServer((req, res) => {
				const url = parseUrl(req.url, port);

				req.query = getQuery(url);

				if (req.method === "GET") {
					handleEndpoint("getHandlers", url.pathname, req, res);
				}
				if (req.method === "POST") {
					handleEndpoint("postHandlers", url.pathname, req, res);
				}
				if (req.method === "PUT") {
					handleEndpoint("putHandlers", url.pathname, req, res);
				}
				if (req.method === "PATCH") {
					handleEndpoint("patchHandlers", url.pathname, req, res);
				}
				if (req.method === "DELETE") {
					handleEndpoint("deleteHandlers", url.pathname, req, res);
				}

				res.end();
			});

			server.listen(port);
			callback();
		},
	};
};

const app = expression();

app.use("/", (req, res, next) => {
	console.log("use request");
	next();
});

app.get("/", (req, res) => {
	console.log("get request");
	res.end();
});
app.post("/", (req, res) => {
	console.log("post request");
	res.end();
});
app.put("/", (req, res) => {
	console.log("put request");
	res.end();
});
app.patch("/", (req, res) => {
	console.log("patch request");
	res.end();
});
app.delete("/", (req, res) => {
	console.log("delete request");
	res.end();
});

app.listen(4000, () => {
	console.log("Server started");
});
