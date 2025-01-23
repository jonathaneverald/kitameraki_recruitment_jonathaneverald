import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { AuthenticatedContext, CreateUserRequest, LoginUserRequest, UpdateUserRequest, User } from "../../model/user-model";
import { UserService } from "../../service/user-service";
import { UserRequest } from "../../type/user-request";
import { handleError } from "../../error/error-handler";
import { withAuth } from "../../middleware/auth-middleware";

const register = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
        context.log(`Http function processed request for url "${request.url}"`);
        const createUserRequest = (await request.json()) as CreateUserRequest;
        const user = await UserService.register(createUserRequest);
        return {
            status: 201,
            body: JSON.stringify(user),
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (error) {
        context.log("Error registering user:", error);
        return handleError(error, context);
    }
};

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

const logout = async (request: UserRequest, context: AuthenticatedContext): Promise<HttpResponseInit> => {
    try {
        if (!context.currentUser) {
            return {
                status: 401,
                body: JSON.stringify({ message: "No authenticated user found" }),
                headers: { "Content-Type": "application/json" },
            };
        }

        request.currentUser = context.currentUser;
        const response = await UserService.logout(request.currentUser);
        return {
            status: 200,
            body: JSON.stringify(response),
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (error) {
        context.log("Error logout user:", error);
        return handleError(error, context);
    }
};

const profile = async (request: HttpRequest, context: AuthenticatedContext): Promise<HttpResponseInit> => {
    try {
        if (!context.currentUser) {
            return {
                status: 401,
                body: JSON.stringify({ message: "No authenticated user found" }),
                headers: { "Content-Type": "application/json" },
            };
        }
        const response = await UserService.get(context.currentUser);
        return {
            status: 200,
            body: JSON.stringify(response),
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (error) {
        context.log("Error logout user:", error);
        return handleError(error, context);
    }
};

const update = async (request: HttpRequest, context: AuthenticatedContext): Promise<HttpResponseInit> => {
    try {
        if (!context.currentUser) {
            return {
                status: 401,
                body: JSON.stringify({ message: "No authenticated user found" }),
                headers: { "Content-Type": "application/json" },
            };
        }

        const updateUserRequest = (await request.json()) as UpdateUserRequest;
        const response = await UserService.update(context.currentUser, updateUserRequest);
        return {
            status: 200,
            body: JSON.stringify(response),
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (error) {
        context.log("Error updating user:", error);
        return handleError(error, context);
    }
};

app.http("register", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: register,
});

app.http("login", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: login,
});

app.http("logout", {
    methods: ["DELETE"],
    authLevel: "anonymous",
    handler: withAuth(logout),
});

app.http("users", {
    methods: ["GET", "PUT"],
    authLevel: "anonymous",
    route: "users",
    handler: async (request: HttpRequest, context: AuthenticatedContext) => {
        if (request.method === "GET") {
            return await withAuth(async (req: HttpRequest, ctx: AuthenticatedContext) => await profile(req, ctx))(request, context);
        } else if (request.method === "PUT") {
            return await withAuth(async (req: HttpRequest, ctx: AuthenticatedContext) => await update(req, ctx))(request, context);
        }
    },
});
