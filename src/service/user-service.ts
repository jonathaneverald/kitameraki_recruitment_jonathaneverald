import { getContainer } from "../database/cosmosClient";
import { CreateUserRequest, LoginUserRequest, ProfileResponse, toUserResponse, UpdateUserRequest, User, UserResponse } from "../model/user-model";
import { UserValidation } from "../validation/user-validation";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { ResponseError } from "../error/response-error";
import { z } from "zod";
import { signJWT } from "../utils/jwt";

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

    static async login(request: LoginUserRequest): Promise<UserResponse> {
        try {
            const loginRequest = UserValidation.LOGIN.parse(request);

            // Check if the username valid
            const query = {
                query: "SELECT c.id, c.username, c.name, c.password FROM c WHERE c.username = @username",
                parameters: [{ name: "@username", value: loginRequest.username }],
            };

            const { resources: users } = await container.items.query(query).fetchAll();
            if (!users) {
                throw new ResponseError(401, "Username or password is wrong!");
            }
            const user = users[0];

            // Check password
            if (!user.password || !(await bcrypt.compare(loginRequest.password, user.password))) {
                throw new ResponseError(401, "Username or password is wrong!");
            }

            // Creating the JWT token
            const payload = {
                id: user.id,
                username: user.username,
            };
            const token = signJWT(payload);

            // Set the new token for the user
            user.token = token;
            await container.items.upsert(user);

            return toUserResponse(user);
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

    static async logout(user: User): Promise<UserResponse> {
        try {
            const query = {
                query: "SELECT * FROM c WHERE c.id = @id",
                parameters: [{ name: "@id", value: user.id }],
            };

            const { resources: users } = await container.items.query(query).fetchAll();
            if (!users) {
                throw new ResponseError(404, "User not found!");
            }
            const currentUser = users[0];

            // Delete the token for current user
            const updatedUser = {
                ...currentUser,
                token: null,
            };
            await container.items.upsert(updatedUser);

            return toUserResponse(currentUser);
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

    static async get(user: User): Promise<ProfileResponse> {
        return {
            id: user.id,
            username: user.username,
            name: user.name,
        } as ProfileResponse;
    }

    static async update(user: User, request: UpdateUserRequest): Promise<UserResponse> {
        try {
            const updateRequest = UserValidation.UPDATE.parse(request);
            const query = {
                query: "SELECT * FROM c WHERE c.id = @id",
                parameters: [{ name: "@id", value: user.id }],
            };

            const { resources } = await container.items.query(query).fetchAll();
            if (!resources || resources.length === 0) {
                throw new ResponseError(404, "User not found!");
            }

            const currentUser = resources[0];
            const updateData: UpdateUserRequest = {};

            if (updateRequest.name && updateRequest.name !== currentUser.name) {
                updateData.name = updateRequest.name;
            }

            if (updateRequest.password) {
                const passwordMatches = await bcrypt.compare(updateRequest.password, currentUser.password);
                if (!passwordMatches) {
                    updateData.password = await bcrypt.hash(updateRequest.password, 10);
                }
            }

            if (Object.keys(updateData).length === 0) {
                return toUserResponse(currentUser); // Return current user if no changes
            }

            const updatedUser = {
                ...currentUser,
                ...updateData,
                updatedAt: new Date().toISOString(),
            };
            await container.items.upsert(updatedUser);

            return {
                id: updatedUser.id,
                username: updatedUser.username,
                name: updatedUser.name,
            };
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
