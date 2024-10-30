import { Task } from "../database/task-schema";

export type TaskRespone = {
  task_id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: string;
  status: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTaskRequest = {
  task_id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: string;
  status: string;
  tags: string[];
};

export function toTaskResponse(task: Task): TaskRespone {
  return {
    task_id: task.task_id,
    title: task.title,
    description: task.description || "",
    dueDate: task.dueDate,
    priority: task.priority || "",
    status: task.status,
    tags: task.tags || [],
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}
