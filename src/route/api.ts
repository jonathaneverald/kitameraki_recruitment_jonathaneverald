import express from "express";
import { TaskController } from "../controller/task-controller";
import { UserController } from "../controller/user-controller";
import { authMiddleware } from "../middleware/auth-middleware";

export const apiRouter = express.Router();

// Task API
apiRouter.post("/api/tasks", TaskController.create);
apiRouter.get("/api/tasks/:taskId", TaskController.get);
apiRouter.put("/api/tasks/:taskId", TaskController.update);
apiRouter.delete("/api/tasks/:taskId", TaskController.delete);
apiRouter.get("/api/tasks", TaskController.search);

// User API
apiRouter.post("/api/users/register", UserController.register);
apiRouter.post("/api/users/login", UserController.login);

apiRouter.use(authMiddleware);
apiRouter.get("/api/users/current", UserController.get);
apiRouter.put("/api/users/current", UserController.update);
apiRouter.delete("/api/users/current", UserController.logout);
