import express from "express";
import "../database/connectDB"; // connect to DB
import { apiRouter } from "../route/api";
import { errorMiddleware } from "../middleware/error-middleware";

export const web = express();
web.use(express.json());
web.use(apiRouter);
web.use(errorMiddleware);
