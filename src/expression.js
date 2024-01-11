import http from "http";
import executeSequently from "./helpers/executeSequently.js";
import getQuery from "./helpers/query.js";
import parseUrl from "./helpers/parseUrl.js";
import joinPaths from "./helpers/joinPaths.js";
import nodePath from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = nodePath.dirname(fileURLToPath(import.meta.url));

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
	let staticFolder = "static";

	const handleEndpoint = (endpoint, url, req, res) => {
		for (const path in endpoints[endpoint]) {
			if (Object.hasOwnProperty.call(endpoints[endpoint], path)) {
				if (url === path) {
					const handlers = endpoints[endpoint][path];

					executeSequently(handlers, req, res);
				}
			}
		}
	};

	const json = (res, data, status = 200) => {
		res.setHeader("Content-type", "application/json; charsets=utf-8");
		res.statusCode = status;
		res.end(JSON.stringify(data));
	};

	const send = (res, data, status = 200) => {
		res.setHeader("Content-type", "text/plain; charset=utf-8");
		res.statusCode = status;
		res.end(data);
	};

	const sendFile = (res, filename, status = 200) => {
		res.setHeader("Content-type", "text/html; charset=utf-8");
		res.statusCode = status;

		if (filename[0] === "/") {
			filename = filename.slice(1);
		}

		const path = nodePath.join(__dirname, staticFolder, filename);

		const data = fs.readFileSync(path, { encoding: "utf-8" });

		res.end(data);
	};

	return {
		setStaticFoler(folder) {
			return (req, res, next) => {
				staticFolder = folder;
				next();
			};
		},
		use(...args) {
			if (typeof args[0] === "string" && typeof args[1] === "function") {
				const path = args[0];

				endpoints.middlewares[joinPaths(globalPath, path)] = args.splice(1);
			} else if (typeof args[0] === "string") {
				const path = args[0];

				globalPath = joinPaths(globalPath, path);
			} else if (typeof args[0] === "function") {
				endpoints.middlewares[globalPath] = args;
			} else {
				console.error("Incorrect arguments");
			}
		},
		get(path = "/", ...handlers) {
			endpoints.GET[joinPaths(globalPath, path.slice(1))] = handlers;
		},
		post(path = "/", ...handlers) {
			endpoints.POST[joinPaths(globalPath, path.slice(1))] = handlers;
		},
		put(path = "/", ...handlers) {
			endpoints.PUT[joinPaths(globalPath, path.slice(1))] = handlers;
		},
		patch(path = "/", ...handlers) {
			endpoints.PATCH[joinPaths(globalPath, path.slice(1))] = handlers;
		},
		delete(path = "/", ...handlers) {
			endpoints.DELETE[joinPaths(globalPath, path.slice(1))] = handlers;
		},
		listen(port, callback) {
			const server = http.createServer((req, res) => {
				const url = parseUrl(req.url, port);

				req.query = getQuery(url);

				let body = "";
				req.on("data", (chunk) => {
					body += chunk;
				});

				req.on("end", () => {
					req.body = JSON.parse(body);

					res.json = (data, status) => {
						json(res, data, status);
					};

					res.send = (data, status) => {
						send(res, data, status);
					};

					res.sendFile = (filename, status) => {
						sendFile(res, filename, status);
					};

					res.setHeader("Author", "Jamshudanamana");

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
				});
			});

			server.listen(port, callback);
		},
	};
};

export default expression;
