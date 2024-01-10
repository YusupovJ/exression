import http from "http";
import nodePath from "path";

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

    const handleEndpoint = (endpoint, url, req, res) => {
        for (const path in endpoints[endpoint]) {
            if (Object.hasOwnProperty.call(endpoints[endpoint], path)) {
                if (url === path) {
                    const handler = endpoints[endpoint][path];

                    console.log("asd");
                    handler(req, res);
                }
            }
        }
    };

    return {
        use(...args) {
            if (typeof args[0] === "string" && typeof args[1] === "function") {
            } else if (typeof args[0] === "string") {
                const path = args[0];

                if (globalPath === "/") {
                    globalPath += path.slice(1);
                } else {
                    globalPath += path;
                }
            } else if (typeof args[0] === "function") {
            } else {
                console.error("Incorrect arguments");
            }
        },
        get(path = "/", handler) {
            endpoints.GET[globalPath + path.slice(1)] = handler;
        },
        post(path = "/", handler) {
            endpoints.POST[globalPath + path.slice(1)] = handler;
        },
        put(path = "/", handler) {
            endpoints.PUT[globalPath + path.slice(1)] = handler;
        },
        patch(path = "/", handler) {
            endpoints.PATCH[globalPath + path.slice(1)] = handler;
        },
        delete(path = "/", handler) {
            endpoints.DELETE[globalPath + path.slice(1)] = handler;
        },
        listen(port, callback) {
            const server = http.createServer((req, res) => {
                const url = parseUrl(req.url, port);

                req.query = getQuery(url);

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

app.get("/", (req, res) => {
    console.log("get handler");
    res.end();
});

app.listen(4000, () => {
    console.log("Server started");
});
