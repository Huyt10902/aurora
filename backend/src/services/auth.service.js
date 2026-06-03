import { hashPassword, verifyPassword } from "../lib/password.js";
import {
	getRefreshTokenExpiresAt,
	hashToken,
	signAccessToken,
	signRefreshToken,
	verifyRefreshToken,
} from "../lib/tokens.js";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,40}$/;

export class AuthService {
	constructor({ userRepository, roleRepository, mediaAssetRepository, refreshTokenRepository }) {
		this.userRepository = userRepository;
		this.roleRepository = roleRepository;
		this.mediaAssetRepository = mediaAssetRepository;
		this.refreshTokenRepository = refreshTokenRepository;
	}

	async register({ username, email, password, fullName, imageUrl }) {
		const normalizedUsername = String(username || "").trim().toLowerCase();
		const normalizedEmail = String(email || "").trim().toLowerCase();
		const normalizedPassword = String(password || "");
		const displayName = String(fullName || normalizedUsername).trim();

		if (!USERNAME_PATTERN.test(normalizedUsername)) {
			const error = new Error("Username must be 3-40 characters and use letters, numbers, or underscores");
			error.status = 400;
			throw error;
		}
		if (!normalizedEmail.includes("@")) {
			const error = new Error("Please provide a valid email");
			error.status = 400;
			throw error;
		}
		if (normalizedPassword.length < 8) {
			const error = new Error("Password must be at least 8 characters");
			error.status = 400;
			throw error;
		}

		const avatarUrl =
			String(imageUrl || "").trim() ||
			`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(displayName || normalizedUsername)}`;
		const avatar = await this.mediaAssetRepository.findOrCreate({
			provider: "external",
			resourceType: "image",
			url: avatarUrl,
		});

		const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
		const role = await this.roleRepository.findByCode(normalizedEmail === adminEmail ? "admin" : "user");
		const passwordHash = await hashPassword(normalizedPassword);

		try {
			const user = await this.userRepository.create({
				username: normalizedUsername,
				email: normalizedEmail,
				passwordHash,
				fullName: displayName || normalizedUsername,
				avatarAssetId: avatar.id,
				roleId: role.id,
			});

			return this.createSession(user);
		} catch (error) {
			if (error.code === "23505") {
				error.status = 409;
				error.message = "Username or email already exists";
			}
			throw error;
		}
	}

	async login({ identifier, password }) {
		const normalizedIdentifier = String(identifier || "").trim().toLowerCase();
		const user = await this.userRepository.findByIdentifier(normalizedIdentifier);
		const isValidPassword = user ? await verifyPassword(String(password || ""), user.password_hash) : false;

		if (!user || !isValidPassword) {
			const error = new Error("Invalid username/email or password");
			error.status = 401;
			throw error;
		}

		return this.createSession(user);
	}

	async refresh(refreshToken) {
		if (!refreshToken) {
			const error = new Error("Missing refresh token");
			error.status = 401;
			throw error;
		}

		const payload = verifyRefreshToken(refreshToken);
		const token = await this.refreshTokenRepository.findActive(hashToken(refreshToken), payload.userId);
		if (!token || payload.type !== "refresh") {
			const error = new Error("Invalid or expired refresh token");
			error.status = 401;
			throw error;
		}

		await this.refreshTokenRepository.revoke(hashToken(refreshToken));
		const user = await this.userRepository.findById(payload.userId);
		if (!user) {
			const error = new Error("User no longer exists");
			error.status = 401;
			throw error;
		}

		return this.createSession(user);
	}

	async logout(refreshToken) {
		if (refreshToken) {
			await this.refreshTokenRepository.revoke(hashToken(refreshToken));
		}
	}

	async createSession(user) {
		const accessToken = signAccessToken(user);
		const refreshToken = signRefreshToken(user);

		await this.refreshTokenRepository.create({
			userId: user.id,
			tokenHash: hashToken(refreshToken),
			expiresAt: getRefreshTokenExpiresAt(),
		});

		return { user, accessToken, refreshToken };
	}
}
