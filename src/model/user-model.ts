import { IUser, User } from "../database/user-schema";

export type UserResponse = {
  user_id: string;
  username: string;
  name: string;
  token?: string;
};

export type CreateUserRequest = {
  user_id: string;
  username: string;
  name: string;
  password: string;
};

export type LoginUserRequest = {
  username: string;
  password: string;
};

export function toUserResponse(user: User | IUser): UserResponse {
  if (!user) {
    throw new Error("User object is required");
  }

  return {
    user_id: user.user_id,
    username: user.username,
    name: user.name,
    token: user.token,
  };
}
