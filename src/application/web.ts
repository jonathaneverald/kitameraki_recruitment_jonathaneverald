import express from "express";
import "../database/connectDB"; // connect to DB
import { apiRouter } from "../route/api";

export const web = express();
web.use(express.json());
web.use(apiRouter);
