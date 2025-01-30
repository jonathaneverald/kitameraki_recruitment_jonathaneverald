export type Task = {
    id?: string;
    title: string;
    description?: string;
    dueDate?: Date;
    priority: "low" | "medium" | "high";
    status: "todo" | "in-progress" | "completed";
    tags?: string[];
    username?: string;
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
};

export type CreateTaskRequest = Omit<Task, "createdAt" | "updatedAt">;
export type UpdateTaskRequest = Partial<Omit<CreateTaskRequest, "id" | "username" | "userId">>;
export type TaskRequest = Partial<Omit<CreateTaskRequest, "username" | "userId">>;
export type SearchTaskRequest = Partial<Pick<Task, "title" | "priority" | "status">> & {
    page: number;
    size: number;
};

export const toTaskResponse = (task: Task): Task => {
    return {
        id: task.id,
        title: task.title,
        description: task.description || "",
        dueDate: task.dueDate || null,
        priority: task.priority || "low",
        status: task.status,
        tags: task.tags,
        username: task.username || "",
        userId: task.userId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
    };
};

export const UPDATABLE_TASK_FIELDS = ["title", "description", "dueDate", "priority", "status", "tags"] as const;
export type UpdatableTaskField = (typeof UPDATABLE_TASK_FIELDS)[number];
// Function to get changed fields
export const getChangedTaskFields = (request: UpdateTaskRequest, existingTask: Task): Partial<UpdateTaskRequest> => {
    return UPDATABLE_TASK_FIELDS.reduce((updates, field) => {
        const newValue = request[field];
        if (newValue !== undefined && newValue !== existingTask[field]) {
            (updates as any)[field] = newValue;
        }
        return updates;
    }, {} as Partial<UpdateTaskRequest>);
};
