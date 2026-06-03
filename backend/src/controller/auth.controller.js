import { getCookie } from "../lib/cookies.js";
import { getRefreshCookieOptions } from "../lib/tokens.js";
import { serializeUser } from "../lib/serializers.js";
import { services } from "../services/index.js";

const REFRESH_COOKIE_NAME = "refreshToken";

const sendAuthResponse = (res, session) => {
	res.cookie(REFRESH_COOKIE_NAME, session.refreshToken, getRefreshCookieOptions());
	res.status(200).json({
		user: serializeUser(session.user),
		accessToken: session.accessToken,
	});
};

export const register = async (req, res, next) => {
	try {
		const session = await services.authService.register(req.body);
		sendAuthResponse(res, session);
	} catch (error) {
		next(error);
	}
};

export const login = async (req, res, next) => {
	try {
		const session = await services.authService.login({
			identifier: req.body.identifier || req.body.email || req.body.username,
			password: req.body.password,
		});
		sendAuthResponse(res, session);
	} catch (error) {
		error.status = error.status || 401;
		next(error);
	}
};

export const refresh = async (req, res, next) => {
	try {
		const refreshToken = getCookie(req, REFRESH_COOKIE_NAME) || req.body.refreshToken;
		const session = await services.authService.refresh(refreshToken);
		sendAuthResponse(res, session);
	} catch (error) {
		next(error);
	}
};

export const logout = async (req, res, next) => {
	try {
		const refreshToken = getCookie(req, REFRESH_COOKIE_NAME) || req.body.refreshToken;
		await services.authService.logout(refreshToken);
		res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
		res.status(200).json({ success: true });
	} catch (error) {
		next(error);
	}
};

export const me = async (req, res) => {
	res.status(200).json({ user: req.user });
};
