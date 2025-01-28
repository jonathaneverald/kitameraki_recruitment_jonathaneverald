import { z, ZodType } from "zod";

export class UserValidation {
    static readonly REGISTER: ZodType = z.object({
        // id: z.string().uuid({ message: "Invalid UUID format for id" }),
        username: z.string().min(1, { message: "Username is required" }).max(100, { message: "Username cannot exceed 100 characters" }),
        name: z.string().min(1, { message: "Name is required" }).max(100, { message: "Name cannot exceed 100 characters" }),
        password: z.string().min(1, { message: "Password is required" }).max(100, { message: "Password cannot exceed 100 characters" }),
    });

    static readonly LOGIN: ZodType = z.object({
        username: z.string().min(1, { message: "Username is required" }).max(100, { message: "Username cannot exceed 100 characters" }),
        password: z.string().min(1, { message: "Password is required" }).max(100, { message: "Password cannot exceed 100 characters" }),
    });
    static readonly UPDATE: ZodType = z.object({
        name: z.string().min(1, { message: "Name is required" }).max(100, { message: "Name cannot exceed 100 characters" }).optional(),
        password: z.string().min(1, { message: "Password is required" }).max(100, { message: "Password cannot exceed 100 characters" }).optional(),
    });
}
