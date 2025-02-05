import { ActivityHandler } from "durable-functions";
import { AuthenticatedContext, currentUser, User } from "../../model/user-model";
import { CreateTaskRequest, Task, TaskRequest, UpdateTaskRequest } from "../../model/task-model";
import { TaskService } from "../../service/task-service";
import * as df from "durable-functions";

export interface TaskActivityInput {
    tasks: TaskRequest[];
    operation: string;
}

const processTaskBatch: ActivityHandler = async (input: TaskActivityInput & { user: currentUser }, context: AuthenticatedContext): Promise<string[]> => {
    const { tasks, operation, user } = input;
    const results: string[] = [];
    console.log("Authenticated User: ", context.currentUser);

    for (const task of tasks) {
        try {
            if (operation === "create") {
                const createTaskRequest: CreateTaskRequest = {
                    title: task.title,
                    description: task.description,
                    dueDate: task.dueDate,
                    priority: task.priority,
                    status: task.status,
                    tags: task.tags,
                };
                await TaskService.create(user, createTaskRequest);
                results.push(`Created task:  ${task.title}`);
            } else if (operation === "update") {
                const updateTaskRequest: UpdateTaskRequest = {
                    title: task.title,
                    description: task.description,
                    dueDate: task.dueDate,
                    priority: task.priority,
                    status: task.status,
                    tags: task.tags,
                };

                // Only include defined fields in the request
                const cleanedRequest: UpdateTaskRequest = Object.fromEntries(Object.entries(updateTaskRequest).filter(([_, value]) => value !== undefined)) as UpdateTaskRequest;
                await TaskService.update(user, cleanedRequest, task.id);
                results.push(`Updated task with ID:  ${task.id}`);
            } else if (operation === "delete") {
                await TaskService.delete(user, task.id);
                results.push(`Deleted task with ID:  ${task.id}`);
            } else {
                results.push(`No operation performed on task ${task.id}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            results.push(`Error processing task ${task.id}: ${errorMessage}`);
        }
    }
    return results;
};

df.app.activity("taskActivity", { handler: processTaskBatch });

export default processTaskBatch;
