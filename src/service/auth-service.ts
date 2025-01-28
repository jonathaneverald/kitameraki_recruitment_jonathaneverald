import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

export class AuthService {
    async hashPassword(password: string): Promise<{ salt: string; hash: string }> {
        // Generate a random salt
        const salt = randomBytes(16).toString("hex");
        // Hash the password with the salt
        const hash = scryptSync(password, salt, 64).toString("hex");
        return { salt, hash };
    }

    async comparePassword(storedHash: string, storedSalt: string, inputPassword: string): Promise<boolean> {
        // Hash the input password with the same salt
        const inputHash = scryptSync(inputPassword, storedSalt, 64).toString("hex");
        return timingSafeEqual(Buffer.from(inputHash, "hex"), Buffer.from(storedHash, "hex")); // Use `timingSafeEqual` to prevent timing attacks
    }
}
