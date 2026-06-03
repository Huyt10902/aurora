export const getCookie = (req, name) => {
	const header = req.headers.cookie;
	if (!header) return null;

	const cookies = header.split(";").map((cookie) => cookie.trim());
	const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));

	if (!match) return null;
	return decodeURIComponent(match.slice(name.length + 1));
};
