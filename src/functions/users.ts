import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { UserService } from "../service/user-service";
import { handleError } from "../error/error-handler";
import { LoginUserRequest } from "../model/user-model";

const login = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
        context.log(`Http function processed request for url "${request.url}"`);
        const loginUserRequest = (await request.json()) as LoginUserRequest;
        const user = await UserService.login(loginUserRequest);
        return {
            status: 200,
            body: JSON.stringify(user),
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (error) {
        context.log("Error logging in user:", error);
        return handleError(error, context);
    }
};

app.http("login", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: login,
});
