import UserModel, { IUser, User } from "../database/user-schema";
import { ResponseError } from "../error/response-error";
import { CreateUserRequest, LoginUserRequest, toUserResponse, UpdateUserRequest, UserResponse } from "../model/user-model";
import { signJWT } from "../utils/jwt";
import { UserValidation } from "../validation/user-validation";
import { Validation } from "../validation/validation";
import bcrypt from "bcrypt";

export class UserService {
  static async register(request: CreateUserRequest): Promise<UserResponse> {
    const registerRequest = Validation.validate(UserValidation.REGISTER, request);

    // Check if the username already in database
    const existingUsername = await UserModel.countDocuments({
      username: registerRequest.username,
    });
    if (existingUsername != 0) {
      throw new ResponseError(400, "Username already exists");
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10); // Hash the password

    const user: User = await UserModel.create(registerRequest);
    return toUserResponse(user);
  }

  static async login(request: LoginUserRequest): Promise<UserResponse> {
    const loginRequest = Validation.validate(UserValidation.LOGIN, request);

    // Check if username exists in database
    let user = await UserModel.findOne({
      username: loginRequest.username,
    });
    if (!user) {
      throw new ResponseError(401, "Username or password is wrong!");
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(loginRequest.password, user.password);
    if (!isPasswordValid) {
      throw new ResponseError(401, "Username or password is wrong!");
    }

    // Create JWT payload
    const payload = {
      user_id: user.user_id,
      username: user.username,
    };

    // Generate token
    const token = signJWT(payload);

    // Update user with new token
    user = await UserModel.findOneAndUpdate({ username: loginRequest.username }, { token: token }, { new: true });

    return toUserResponse(user as IUser);
  }

  static async get(user: User): Promise<UserResponse> {
    return toUserResponse(user);
  }

  static async update(user: User, request: UpdateUserRequest): Promise<UserResponse> {
    const updateRequest = Validation.validate(UserValidation.UPDATE, request);

    const updateData: any = {};

    if (updateRequest.name) {
      updateData.name = updateRequest.name;
    }

    if (updateRequest.password) {
      updateData.password = await bcrypt.hash(updateRequest.password, 10);
    }

    const result = await UserModel.findOneAndUpdate({ user_id: user.user_id }, { $set: updateData }, { new: true, runValidators: true });

    if (!result) {
      throw new ResponseError(404, "User not found!");
    }

    return toUserResponse(result);
  }

  static async logout(user: User): Promise<UserResponse> {
    const result = await UserModel.findOneAndUpdate({ username: user.username }, { $set: { token: null } }, { new: true });

    if (!result) {
      throw new ResponseError(404, "User not found!");
    }

    return toUserResponse(result);
  }
}
