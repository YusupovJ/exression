const getQuery = (url) => {
	const query = {};

	url.search.split("&").forEach((property) => {
		const key = property.split("=")[0];
		const value = property.split("=")[1];

		query[key] = value;
	});
	return query;
};

export default getQuery;
