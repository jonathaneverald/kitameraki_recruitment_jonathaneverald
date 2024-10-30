import express from "express";
import { connectDB } from "../database/connectDB";
import { apiRouter } from "../route/api";
import { errorMiddleware } from "../middleware/error-middleware";
import { swaggerUiServe, swaggerUiSetup } from "./swagger";
import { publicRouter } from "../route/public-api";

export const web = express();

export const initializeServer = async () => {
  await connectDB();
  web.use(express.json());
  web.use(publicRouter);
  web.use(apiRouter);
  web.use(errorMiddleware);
  web.use("/api-docs", swaggerUiServe, swaggerUiSetup);
};

initializeServer();
