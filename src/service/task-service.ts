import TaskModel, { Task } from "../database/task-schema";
import { ResponseError } from "../error/response-error";
import { CreateTaskRequest, TaskResponse, toTaskResponse, UpdateTaskRequest } from "../model/task-model";
import { TaskValidation } from "../validation/task-validation";
import { Validation } from "../validation/validation";

export class TaskService {
  static async create(request: CreateTaskRequest): Promise<TaskResponse> {
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
  static async get(id: string): Promise<TaskResponse> {
    const task = await this.checkTaskId(id);

    return toTaskResponse(task);
  }

  static async update(request: UpdateTaskRequest, id: string): Promise<TaskResponse> {
    const checkId = await this.checkTaskId(id);
    if (request.dueDate) {
      request.dueDate = new Date(request.dueDate);
    }
    const updateRequest = Validation.validate(TaskValidation.UPDATE, request);
    const task = await TaskModel.findOneAndUpdate({ task_id: checkId.task_id }, { $set: updateRequest }, { new: true, runValidators: true });

    if (!task) {
      throw new ResponseError(404, "Task not found!");
    }

    return toTaskResponse(task);
  }

  static async delete(id: string): Promise<TaskResponse> {
    await this.checkTaskId(id);

    const task = await TaskModel.findOneAndDelete({
      task_id: id,
    });

    if (!task) {
      throw new ResponseError(404, "Task not found");
    }

    return toTaskResponse(task);
  }
}
