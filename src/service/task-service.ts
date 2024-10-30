import TaskModel, { Task } from "../database/task-schema";
import { ResponseError } from "../error/response-error";
import { CreateTaskRequest, TaskRespone, toTaskResponse } from "../model/task-model";
import { TaskValidation } from "../validation/task-validation";
import { Validation } from "../validation/validation";

export class TaskService {
  static async create(request: CreateTaskRequest): Promise<TaskRespone> {
    if (request.dueDate) {
      request.dueDate = new Date(request.dueDate);
    }
    const createRequest = Validation.validate(TaskValidation.CREATE, request);
    const task: Task = await TaskModel.create(createRequest);
    return toTaskResponse(task);
  }

  static async checkTaskId(taskId: string): Promise<Task> {
    const task = await TaskModel.findOne({
      task_id: taskId,
    });
    if (!task) {
      throw new ResponseError(404, "Task not found!");
    }
    return task;
  }

  // Get task by id
  static async get(id: string): Promise<TaskRespone> {
    const task = await this.checkTaskId(id);

    return toTaskResponse(task);
  }
}
