import { getContainer } from "../database/cosmosClient";
import { CreateUserRequest, toUserResponse, UserResponse } from "../model/user-model";
import { Validation } from "../validation/validation";
import { UserValidation } from "../validation/user-validation";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { ResponseError } from "../error/response-error";
import { z } from "zod";

const databaseId = "TaskManagementJo";
const containerId = "Users";

const container = getContainer(databaseId, containerId);

export class UserService {
    static async register(request: CreateUserRequest): Promise<UserResponse> {
        try {
            request.id = uuidv4();
            const registerRequest = UserValidation.REGISTER.parse(request);
            // Check if the username is already in database
            const query = {
                query: "SELECT COUNT(1) AS count FROM c WHERE c.username = @username",
                parameters: [{ name: "@username", value: registerRequest.username }],
            };

            const { resources: existingUsername } = await container.items.query(query).fetchAll();
            const count = existingUsername[0]?.count || 0;
            if (count > 0) {
                throw new ResponseError(400, "Username already exists");
            }

            registerRequest.password = await bcrypt.hash(registerRequest.password, 10); // Hash the password

            const { resource: createdUser } = await container.items.create(registerRequest);

            return toUserResponse(createdUser);
        } catch (error) {
            if (error instanceof ResponseError) {
                // Log the error and re-throw it for specific handling in index.ts
                console.error("Validation or user error:", error.message);
                throw error;
            } else if (error instanceof z.ZodError) {
                console.error("Validation error:", error.errors);
                // Map Zod errors to a more detailed structure and throw the details
                const details = error.errors.map((e) => ({
                    field: e.path.join("."), // Join path segments for nested objects
                    message: e.message,
                }));

                throw new ResponseError(400, "Validation failed", details);
            }

            console.error("Unexpected error in user-service:", error);
            throw new ResponseError(500, "An unexpected error occurred");
        }
    }
}
