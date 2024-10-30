import jwt from "jsonwebtoken";
import CONFIG from "../config/enviroment";

export const signJWT = (payload: Object, options?: jwt.SignOptions | undefined) => {
  return jwt.sign(payload, CONFIG.jwt_secret, {
    ...options,
    algorithm: "HS256",
    expiresIn: CONFIG.jwt_expiration,
  });
};
