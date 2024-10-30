import express from "express";
import { TaskController } from "../controller/task-controller";
import { UserController } from "../controller/user-controller";

export const apiRouter = express.Router();

// Task API
apiRouter.post("/api/tasks", TaskController.create);
apiRouter.get("/api/tasks/:taskId", TaskController.get);
apiRouter.put("/api/tasks/:taskId", TaskController.update);
apiRouter.delete("/api/tasks/:taskId", TaskController.delete);
apiRouter.get("/api/tasks", TaskController.search);

// User API
apiRouter.post("/api/users/register", UserController.register);
