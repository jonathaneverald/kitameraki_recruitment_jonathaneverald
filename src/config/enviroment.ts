import "dotenv/config";

const CONFIG = {
  db: process.env.DB,
  jwt_secret: process.env.JWT_SECRET || "fallback-secret-key",
  jwt_expiration: process.env.JWT_EXPIRATION || "1d",
};

export default CONFIG;
