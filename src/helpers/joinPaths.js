const joinPaths = (global, local) => {
	if (global === "/") {
		return global + local.slice(1);
	}

	return global + local;
};

export default joinPaths;
