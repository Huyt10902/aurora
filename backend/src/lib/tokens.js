import crypto from "crypto";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 30);

const getAccessSecret = () => {
	if (!process.env.JWT_ACCESS_SECRET) {
		throw new Error("Missing JWT_ACCESS_SECRET");
	}
	return process.env.JWT_ACCESS_SECRET;
};

const getRefreshSecret = () => {
	if (!process.env.JWT_REFRESH_SECRET) {
		throw new Error("Missing JWT_REFRESH_SECRET");
	}
	return process.env.JWT_REFRESH_SECRET;
};

export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const signAccessToken = (user) =>
	jwt.sign(
		{
			userId: user.id,
			email: user.email,
			role: user.role,
		},
		getAccessSecret(),
		{ expiresIn: ACCESS_TOKEN_EXPIRES_IN }
	);

export const signRefreshToken = (user) =>
	jwt.sign(
		{
			userId: user.id,
			type: "refresh",
			jti: crypto.randomUUID(),
		},
		getRefreshSecret(),
		{ expiresIn: `${REFRESH_TOKEN_EXPIRES_IN_DAYS}d` }
	);

export const verifyAccessToken = (token) => jwt.verify(token, getAccessSecret());
export const verifyRefreshToken = (token) => jwt.verify(token, getRefreshSecret());

export const getRefreshTokenExpiresAt = () => new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);

export const getRefreshCookieOptions = () => ({
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax",
	path: "/api/auth",
	maxAge: REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
});
