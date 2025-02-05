const config = {
    db: process.env.CosmosDBConnectionString || "", // Cosmos DB connection string
    jwt_secret: process.env.JWT_SECRET || "fallback-secret-key", // JWT secret
    jwt_expiration: process.env.JWT_EXPIRATION || "1d", // JWT expiration
    eventgrid_endpoint: process.env.EVENTGRID_ENDPOINT || "", // Event Grid endpoint
    eventgrid_access_key: process.env.EVENTGRID_ACCESS_KEY || "", // Event Grid access key
};

export default config;
