import crypto from "crypto";
import { promisify } from "util";

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;

export const hashPassword = async (password) => {
	const salt = crypto.randomBytes(16).toString("hex");
	const derivedKey = await scrypt(password, salt, KEY_LENGTH);

	return `scrypt:${salt}:${derivedKey.toString("hex")}`;
};

export const verifyPassword = async (password, passwordHash) => {
	const [scheme, salt, storedHash] = passwordHash.split(":");
	if (scheme !== "scrypt" || !salt || !storedHash) return false;

	const derivedKey = await scrypt(password, salt, KEY_LENGTH);
	const storedBuffer = Buffer.from(storedHash, "hex");

	if (storedBuffer.length !== derivedKey.length) return false;
	return crypto.timingSafeEqual(storedBuffer, derivedKey);
};
