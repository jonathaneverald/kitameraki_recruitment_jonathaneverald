import express from "express";
import { TaskController } from "../controller/task-controller";

export const apiRouter = express.Router();

// Task API
apiRouter.post("/api/tasks", TaskController.create);
