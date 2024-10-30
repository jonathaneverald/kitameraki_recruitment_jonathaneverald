import UserModel, { User } from "../database/user-schema";
import { ResponseError } from "../error/response-error";
import { CreateUserRequest, toUserResponse, UserResponse } from "../model/user-model";
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
}
