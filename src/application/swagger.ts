import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

// Read the OpenAPI specification file
const openApiPath = path.join(__dirname, "../../docs/openapi.json");
const openApiSpec = JSON.parse(fs.readFileSync(openApiPath, "utf8"));

// Swagger UI options
const options = {
  swaggerOptions: {
    persistAuthorization: true,
  },
};

export const swaggerUiSetup = swaggerUi.setup(openApiSpec, options);
export const swaggerUiServe = swaggerUi.serve;
