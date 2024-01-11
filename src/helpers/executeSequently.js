const executeSequently = (handlers, req, res) => {
	const executeNext = (index) => {
		if (index < handlers.length) {
			handlers[index](req, res, () => {
				executeNext(index + 1);
			});
		}
	};

	executeNext(0);
};

export default executeSequently;
