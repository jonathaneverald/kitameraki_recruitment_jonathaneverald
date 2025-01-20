import { getContainer } from "../database/cosmosClient";
import { ResponseError } from "../error/response-error";
import { TaskResponse, toTaskResponse } from "../model/task-model";

const databaseId = "TaskManagementJo";
const containerId = "Tasks";

const container = getContainer(databaseId, containerId);

export class TaskService {
    /**
     * Get all tasks from the Cosmos DB container.
     * @returns An array of Tasks objects.
     */
    static async getAllTasks(): Promise<TaskResponse[]> {
        const query = {
            query: "SELECT * FROM c",
        };
        const { resources: tasks } = await container.items.query(query).fetchAll();
        if (!tasks) {
            throw new ResponseError(404, "Task not found!");
        }
        return tasks.map(toTaskResponse);
    }
}
