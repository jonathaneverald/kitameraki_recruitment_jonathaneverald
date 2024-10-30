import { Request, Response, NextFunction } from "express";
import { ResponseError } from "../error/response-error";
import UserModel from "../database/user-schema";
import { UserRequest } from "../type/user-request";

export const authMiddleware = async (req: UserRequest, res: Response, next: NextFunction) => {
  const accessToken = req.get("Authorization");

  if (accessToken) {
    const user = await UserModel.findOne({
      token: accessToken,
    });
    if (user) {
      req.user = user;
      next();
      return;
    }
  }
  res
    .status(401)
    .json({
      errors: "Unauthorized!",
    })
    .end();
};
