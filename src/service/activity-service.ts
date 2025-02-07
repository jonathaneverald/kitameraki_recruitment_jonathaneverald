import { z } from "zod";
import { getContainer } from "../database/cosmosClient";
import { ResponseError } from "../error/response-error";
import { Task } from "../model/task-model";
import { ActivityLog } from "../model/activity-model";

const databaseId = "TaskManagementJo";
const conteinerId = "ActivityLog";

const container = getContainer(databaseId, conteinerId);

export class ActivityService {
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

        console.error("Unexpected error in activity-service:", error);
        throw new ResponseError(500, "An unexpected error occurred");
    }
    static async create(data: ActivityLog, userId: string) {
        try {
            const createdActivity = {
                ...data,
                userId: userId,
            };
            const { resource } = await container.items.create(createdActivity);
            return resource;
        } catch (error) {
            this.handleServiceError(error);
        }
    }
}
