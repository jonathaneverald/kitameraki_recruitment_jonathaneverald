import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { CreateTaskRequest } from "../model/task-model";
import { TaskService } from "../service/task-service";

export class TaskController {
  static async create(req: Request, res: Response, next: NextFunction) {
    req.body.task_id = uuidv4();
    try {
      const request: CreateTaskRequest = req.body as CreateTaskRequest;
      const response = await TaskService.create(request);
      res.status(201).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await TaskService.get(req.params.taskId);
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }
}
