import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CreateUserRequest, User } from "../../model/user-model";
import { UserService } from "../../service/user-service";
import { ResponseError } from "../../error/response-error";
import { z } from "zod";

const register = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
        context.log(`Http function processed request for url "${request.url}"`);
        const createUserRequest = (await request.json()) as CreateUserRequest;
        const users = await UserService.register(createUserRequest);
        return {
            status: 200,
            body: JSON.stringify(users),
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (error) {
        context.log("Error registering user:", error);

        // Handle ResponseError thrown by user-service.ts
        if (error instanceof ResponseError) {
            const responseBody: any = { message: error.message };

            // Check if the ResponseError contains validation details
            if (error.details) {
                responseBody.errors = error.details;
            }

            return {
                status: error.status,
                body: JSON.stringify(responseBody),
                headers: {
                    "Content-Type": "application/json",
                },
            };
        }

        return {
            status: 500,
            body: "Internal server error",
            headers: {
                "Content-Type": "application/json",
            },
        };
    }
};

app.http("register", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: register,
});
