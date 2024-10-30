import TaskModel, { Task } from "../database/task-schema";
import { CreateTaskRequest, TaskRespone, toTaskResponse } from "../model/task-model";

export class TaskService {
  static async create(request: CreateTaskRequest): Promise<TaskRespone> {
    // Convert dueDate into Date
    // if (request.dueDate) {
    //   request.dueDate = new Date(request.dueDate);
    // }
    const task: Task = await TaskModel.create(request);
    return toTaskResponse(task);
  }
}
