import { z, ZodType } from "zod";

export class TaskValidation {
  static readonly CREATE: ZodType = z.object({
    task_id: z.string().uuid({ message: "Invalid UUID format for id" }),
    title: z.string().min(1, { message: "Title is required" }).max(100, { message: "Title cannot exceed 100 characters" }),
    description: z.string().max(1000, { message: "Description cannot exceed 1000 characters" }).optional(),
    dueDate: z.date({ required_error: "Due date is required" }).optional(),
    priority: z.enum(["low", "medium", "high"], { message: "Priority must be one of: low, medium, high" }),
    status: z.enum(["todo", "in-progress", "completed"], { message: "Status must be one of: todo, in-progress, completed" }),
    tags: z.array(z.string().max(50, { message: "Each tag cannot exceed 50 characters" })).optional(),
  });
}
