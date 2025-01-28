const config = {
    db: process.env.CosmosDBConnectionString || "", // Cosmos DB connection string
    jwt_secret: process.env.JWT_SECRET || "fallback-secret-key", // JWT secret
    jwt_expiration: process.env.JWT_EXPIRATION || "1d", // JWT expiration
};

export default config;
