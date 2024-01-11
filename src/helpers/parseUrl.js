const parseUrl = (url, port) => {
	const parsedUrl = new URL(`http://localhost:${port}${url}`);
	return parsedUrl;
};

export default parseUrl;
