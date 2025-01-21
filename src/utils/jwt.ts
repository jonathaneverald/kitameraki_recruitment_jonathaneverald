import * as jwt from "jsonwebtoken";
import config from "../config/environment";

export const signJWT = (payload: Object, options?: jwt.SignOptions | undefined) => {
    return jwt.sign(payload, config.jwt_secret, {
        ...options,
        algorithm: "HS256",
        expiresIn: config.jwt_expiration,
    });
};
