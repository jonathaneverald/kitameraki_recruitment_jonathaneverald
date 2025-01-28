import { HttpRequest } from "@azure/functions";
import { User } from "../model/user-model";

export interface UserRequest extends HttpRequest {
    currentUser?: User;
}
