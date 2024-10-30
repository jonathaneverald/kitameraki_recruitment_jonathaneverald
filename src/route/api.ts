import express from "express";
import { TaskController } from "../controller/task-controller";

export const apiRouter = express.Router();

// Task API
apiRouter.post("/api/tasks", TaskController.create);
apiRouter.get("/api/tasks/:taskId", TaskController.get);
apiRouter.put("/api/tasks/:taskId", TaskController.update);
apiRouter.delete("/api/tasks/:taskId", TaskController.delete);
