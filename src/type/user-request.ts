import { User } from "../database/user-schema";
import { Request } from "express";

export interface UserRequest extends Request {
  user?: User;
}
