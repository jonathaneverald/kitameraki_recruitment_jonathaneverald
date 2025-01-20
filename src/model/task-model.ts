export interface Task {
    id: string;
    title: string;
    description?: string;
    dueDate: Date;
    priority?: "low" | "medium" | "high";
    status: "todo" | "in-progress" | "completed";
    tags?: string[];
    username?: string;
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type TaskResponse = {
    id: string;
    title: string;
    description?: string;
    dueDate: Date;
    priority?: string;
    status: string;
    tags?: string[];
    username?: string;
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
};

export type CreateTaskRequest = {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    priority: string;
    status: string;
    tags: string[];
    // username?: string; // take the username from current user that logged in
    // userId?: string; // same as username
};

export type UpdateTaskRequest = {
    id: string;
    title?: string;
    description?: string;
    dueDate?: Date;
    priority?: string;
    status?: string;
    tags?: string[];
};

export type SearchTaskRequest = {
    title?: string;
    priority?: string;
    status?: string;
    page: number;
    size: number;
};

export const toTaskResponse = (task: Task): TaskResponse => {
    return {
        id: task.id,
        title: task.title,
        description: task.description || "",
        dueDate: task.dueDate,
        priority: task.priority || "",
        status: task.status,
        tags: task.tags,
        username: task.username || "",
        userId: task.userId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
    };
};
