import { InvocationContext } from "@azure/functions";

export type User = {
    id: string;
    username: string;
    name: string;
    password: string;
    token?: string;
};

export interface AuthenticatedContext extends InvocationContext {
    currentUser?: User;
}

export type UserResponse = Omit<User, "password">;
export type CreateUserRequest = Omit<User, "token">;
export type LoginUserRequest = Omit<User, "id" | "name" | "token">;
export type UpdateUserRequest = Partial<Pick<User, "name" | "password">>;
export type ProfileResponse = Omit<UserResponse, "token">;

export const toUserResponse = (user: User): UserResponse => {
    if (!user) {
        throw new Error("User object is required");
    }
    return {
        id: user.id,
        username: user.username,
        name: user.name,
        token: user.token || "",
    };
};
