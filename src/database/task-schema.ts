import mongoose, { Document } from "mongoose";
interface Task extends Document {
  task_id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority?: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "completed";
  tags?: string[];
  username?: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new mongoose.Schema(
  {
    task_id: {
      type: String,
      unique: true,
      required: true,
      description: "Unique identifier for the task",
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
      description: "Title of the task",
    },
    description: {
      type: String,
      maxlength: 1000,
      description: "Description of the task",
    },
    dueDate: {
      type: Date,
      required: true,
      description: "Due date and time for the task",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      description: "Priority level of the task",
    },
    status: {
      type: String,
      required: true,
      enum: ["todo", "in-progress", "completed"],
      description: "Status of the task",
    },
    tags: {
      type: [String],
      maxlength: 50,
      description: "Tags associated with the task",
    },
    username: {
      type: String,
      description: "Task belongs to this username",
    },
  },
  { timestamps: true }
);

const TaskModel = mongoose.model<Task>("task", taskSchema);

export default TaskModel;
export type { Task };
