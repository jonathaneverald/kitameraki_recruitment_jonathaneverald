import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { CreateTaskRequest, SearchTaskRequest, UpdateTaskRequest } from "../model/task-model";
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

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const request: UpdateTaskRequest = req.body as UpdateTaskRequest;
      const response = await TaskService.update(request, req.params.taskId);
      res.status(200).json({
        data: response,
      });
    } catch (e) {
      next(e);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await TaskService.delete(req.params.taskId);
      res.status(200).json({
        data: `Successfully delete task with ID: ${response.task_id}`,
      });
    } catch (e) {
      next(e);
    }
  }

  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const request: SearchTaskRequest = {
        title: req.query.title as string,
        priority: req.query.priority as string,
        status: req.query.status as string,
        page: req.query.page ? Number(req.query.page) : 1,
        size: req.query.size ? Number(req.query.size) : 5,
      };
      const response = await TaskService.search(request);
      res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }
}
