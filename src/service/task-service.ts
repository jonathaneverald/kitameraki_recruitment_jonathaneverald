import { getContainer } from "../database/cosmosClient";
import { ResponseError } from "../error/response-error";
import { CreateTaskRequest, getChangedTaskFields, SearchTaskRequest, Task, toTaskResponse, UpdateTaskRequest } from "../model/task-model";
import { TaskValidation } from "../validation/task-validation";
import { User } from "../model/user-model";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { Pageable } from "../model/pagination";

const databaseId = "TaskManagementJo";
const containerId = "Tasks";

const container = getContainer(databaseId, containerId);

export class TaskService {
    private static handleServiceError(error: unknown): never {
        if (error instanceof ResponseError) {
            console.error("Validation or user error:", error.message);
            throw error;
        }

        if (error instanceof z.ZodError) {
            console.error("Validation error:", error.errors);
            const details = error.errors.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            }));
            throw new ResponseError(400, "Validation failed", details);
        }

        console.error("Unexpected error in task-service:", error);
        throw new ResponseError(500, "An unexpected error occurred");
    }

    static async create(user: User, request: CreateTaskRequest): Promise<Task> {
        try {
            request.id = uuidv4();
            const createRequest = TaskValidation.CREATE.parse(request);

            const createdTask = {
                ...createRequest,
                userId: user.id,
                username: user.username,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const { resource } = await container.items.create(createdTask);
            return toTaskResponse(resource);
        } catch (error) {
            this.handleServiceError(error);
        }
    }

    static async getTaskDetail(user: User, id: string): Promise<Task> {
        const task = await this.checkTaskId(user.id, id);
        return toTaskResponse(task);
    }

    static async checkTaskId(userId: string, taskId: string): Promise<Task> {
        const query = {
            query: "SELECT * FROM c WHERE c.userId = @userId AND c.id = @taskId",
            parameters: [
                { name: "@userId", value: userId },
                { name: "@taskId", value: taskId },
            ],
        };
        const { resources: tasks } = await container.items.query(query).fetchAll();
        if (!tasks || tasks.length === 0) {
            throw new ResponseError(404, `Task with ID ${taskId} not found`);
        }
        return toTaskResponse(tasks[0]);
    }

    static async update(user: User, request: UpdateTaskRequest, id: string): Promise<Task> {
        try {
            const existingTask = await this.checkTaskId(user.id, id);
            const updateRequest = TaskValidation.UPDATE.parse(request);
            const updates = getChangedTaskFields(updateRequest, existingTask);

            if (Object.keys(updates).length === 0) {
                return toTaskResponse(existingTask); // Return current task if no changes
            }

            const updatedTask = {
                ...existingTask,
                ...updates,
                updatedAt: new Date(),
            };
            await container.items.upsert(updatedTask);

            return toTaskResponse(updatedTask);
        } catch (error) {
            this.handleServiceError(error);
        }
    }

    static async getTasks(user: User, request: SearchTaskRequest): Promise<Pageable<Task>> {
        const searchRequest = TaskValidation.SEARCH.parse(request);
        // const skip = (searchRequest.page - 1) * searchRequest.size;

        const filters: string[] = [`c.userId = '${user.id}'`];

        // Add title filter if provided
        if (searchRequest.title) {
            filters.push(`CONTAINS(LOWER(c.title), LOWER('${searchRequest.title}'))`);
        }
        // Add priority filter if provided
        if (searchRequest.priority) {
            filters.push(`c.priority = '${searchRequest.priority}'`);
        }
        // Add status filter if provided
        if (searchRequest.status) {
            filters.push(`c.status = '${searchRequest.status}'`);
        }

        // Combine all filters into where clause
        const whereClause = filters.join(" AND ");
        const query = {
            query: `SELECT * FROM c WHERE ${whereClause} ORDER BY c._ts DESC OFFSET ${(searchRequest.page - 1) * searchRequest.size} LIMIT ${searchRequest.size}`,
            parameters: [],
        };

        try {
            // Get total items count for pagination
            const countQuery = {
                query: `SELECT VALUE COUNT(1) FROM c WHERE ${whereClause}`,
                parameters: [],
            };
            const {
                resources: [total],
            } = await container.items.query(countQuery).fetchAll();

            // Get paginated results
            const { resources: tasks } = await container.items.query(query).fetchAll();

            const totalPages = Math.ceil(total / searchRequest.size);
            if (searchRequest.page > totalPages) {
                return {
                    data: [],
                    paging: {
                        current_page: searchRequest.page,
                        total_page: totalPages,
                        size: searchRequest.size,
                    },
                };
            }

            // Convert to response format
            return {
                data: tasks.map((task) => toTaskResponse(task)),
                paging: {
                    current_page: searchRequest.page,
                    total_page: Math.ceil(total / searchRequest.size),
                    size: searchRequest.size,
                },
            };
        } catch (error) {
            console.error("Error querying Cosmos DB:", error);
            throw error;
        }
    }

    static async delete(user: User, id: string): Promise<Task> {
        try {
            const existingTask = await this.checkTaskId(user.id, id);
            const { resource: deletedTask } = await container.item(existingTask.id, existingTask.userId).delete();

            return toTaskResponse(existingTask);
        } catch (error) {
            this.handleServiceError(error);
        }
    }
}
