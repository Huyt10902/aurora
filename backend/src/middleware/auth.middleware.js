import { verifyAccessToken } from "../lib/tokens.js";
import { serializeUser } from "../lib/serializers.js";
import { UserRepository } from "../repositories/user.repository.js";

const userRepository = new UserRepository();

const getBearerToken = (req) => {
	const authHeader = req.headers.authorization;
	if (!authHeader?.startsWith("Bearer ")) return null;
	return authHeader.slice("Bearer ".length);
};

export const protectRoute = async (req, res, next) => {
	try {
		const token = getBearerToken(req);
		if (!token) {
			return res.status(401).json({ message: "Unauthorized - you must be logged in" });
		}

		const payload = verifyAccessToken(token);
		const user = await userRepository.findById(payload.userId);

		if (!user) {
			return res.status(401).json({ message: "Unauthorized - user no longer exists" });
		}

		req.user = serializeUser(user);
		next();
	} catch (error) {
		return res.status(401).json({ message: "Unauthorized - invalid or expired token" });
	}
};

export const optionalAuth = async (req, res, next) => {
	try {
		const token = getBearerToken(req);
		if (!token) return next();

		const payload = verifyAccessToken(token);
		const user = await userRepository.findById(payload.userId);
		if (user) {
			req.user = serializeUser(user);
		}
	} catch {
		// Anonymous playback should still be counted when the access token is missing or stale.
	}

	next();
};

export const requireAdmin = async (req, res, next) => {
	const isAdmin = req.user?.role === "admin" || req.user?.email === process.env.ADMIN_EMAIL?.toLowerCase();

	if (!isAdmin) {
		return res.status(403).json({ message: "Unauthorized - you must be an admin" });
	}

	next();
};
