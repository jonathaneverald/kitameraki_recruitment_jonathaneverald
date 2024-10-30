import { Task } from "../src/database/task-schema";
import TaskModel from "../src/database/task-schema";
import { v4 as uuidv4 } from "uuid";

export class TaskTest {
  static async create() {
    const task = await TaskModel.create({
      task_id: uuidv4(),
      title: "test",
      description: "test",
      dueDate: "2024-10-30",
      priority: "low",
      status: "todo",
      tags: ["work", "important"],
    });
    return task;
  }

  static async get(taskId: string): Promise<Task> {
    const task = await TaskModel.findOne({
      task_id: taskId,
    });
    if (!task) {
      throw new Error("Task not found!");
    }
    return task;
  }

  static async deleteAll() {
    await TaskModel.deleteMany({});
  }
}
