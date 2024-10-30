import express from "express";
import { connectDB } from "../database/connectDB";
import { apiRouter } from "../route/api";
import { errorMiddleware } from "../middleware/error-middleware";

export const web = express();

export const initializeServer = async () => {
  await connectDB();
  web.use(express.json());
  web.use(apiRouter);
  web.use(errorMiddleware);
};

initializeServer();
