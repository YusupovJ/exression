import expression from "./expression.js";

const app = expression();

app.use(app.setStaticFoler("public"));

app.get("/", (req, res) => {
	res.sendFile("index.html");
});

app.post("/", (req, res) => {
	res.json(req.body);
});

app.listen(4000, () => {
	console.log("Server is running on http://localhost:4000");
});
