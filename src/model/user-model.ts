export interface User {
    id: string;
    username: string;
    name: string;
    password: string;
    token?: string;
}

export type UserResponse = {
    id: string;
    username: string;
    name: string;
    token?: string;
};

export type CreateUserRequest = {
    id: string;
    username: string;
    name: string;
    password: string;
};

export type LoginUserRequest = {
    username: string;
    password: string;
};

export type UpdateUserRequest = {
    name?: string;
    password?: string;
};

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
