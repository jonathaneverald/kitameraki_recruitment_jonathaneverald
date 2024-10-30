import TaskModel, { Task } from "../database/task-schema";
import { User } from "../database/user-schema";
import { ResponseError } from "../error/response-error";
import { Pageable } from "../model/page";
import { CreateTaskRequest, SearchTaskRequest, TaskResponse, toTaskResponse, UpdateTaskRequest } from "../model/task-model";
import { TaskValidation } from "../validation/task-validation";
import { Validation } from "../validation/validation";

export class TaskService {
  static async create(user: User, request: CreateTaskRequest): Promise<TaskResponse> {
    if (request.dueDate) {
      request.dueDate = new Date(request.dueDate);
    }

    const createRequest = Validation.validate(TaskValidation.CREATE, request);
    const record = {
      ...createRequest,
      ...{ username: user.username },
    };
    const task: Task = await TaskModel.create(record);
    return toTaskResponse(task);
  }

  static async checkTaskId(username: string, taskId: string): Promise<Task> {
    const task = await TaskModel.findOne({
      task_id: taskId,
      username: username,
    });
    if (!task) {
      throw new ResponseError(404, "Task not found!");
    }
    return task;
  }

  // Get task by id
  static async get(user: User, id: string): Promise<TaskResponse> {
    const task = await this.checkTaskId(user.username, id);

    return toTaskResponse(task);
  }

  static async update(user: User, request: UpdateTaskRequest, id: string): Promise<TaskResponse> {
    const checkId = await this.checkTaskId(user.username, id);
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

  static async delete(user: User, id: string): Promise<TaskResponse> {
    await this.checkTaskId(user.username, id);

    const task = await TaskModel.findOneAndDelete({
      task_id: id,
    });

    if (!task) {
      throw new ResponseError(404, "Task not found");
    }

    return toTaskResponse(task);
  }

  static async search(user: User, request: SearchTaskRequest): Promise<Pageable<TaskResponse>> {
    const searchRequest = Validation.validate(TaskValidation.SEARCH, request);
    const skip = (searchRequest.page - 1) * searchRequest.size;

    const filters: any = {
      username: user.username,
    };
    // Add title filter if provided
    if (searchRequest.title) {
      filters.title = { $regex: searchRequest.title, $options: "i" }; // 'i' for case-insensitive
    }

    // Add priority filter if provided
    if (searchRequest.priority) {
      filters.priority = searchRequest.priority;
    }

    // Add status filter if provided
    if (searchRequest.status) {
      filters.status = searchRequest.status;
    }

    // Find tasks with pagination
    const tasks = await TaskModel.find(filters).skip(skip).limit(searchRequest.size).exec();

    // Get total count for pagination
    const total = await TaskModel.countDocuments(filters);

    // Convert to response format
    return {
      data: tasks.map((task) => toTaskResponse(task)),
      paging: {
        current_page: searchRequest.page,
        total_page: Math.ceil(total / searchRequest.size),
        size: searchRequest.size,
      },
    };
  }
}
