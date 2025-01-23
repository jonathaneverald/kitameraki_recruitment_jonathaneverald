import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getContainer } from "../database/cosmosClient";
import { AuthenticatedContext, User } from "../model/user-model";
import { Container } from "@azure/cosmos";
import { UserRequest } from "../type/user-request";
import { handleError } from "../error/error-handler";

const databaseId = "TaskManagementJo";
const containerId = "Users";

export const authMiddleware = async (request: HttpRequest, context: AuthenticatedContext, container: Container): Promise<HttpResponseInit | void> => {
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
            return {
                status: 401,
                body: "Unauthorized! - No token provided!",
                headers: {
                    "Content-Type": "application/json",
                },
            };
        }

        // Extract token from header
        const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
        const query = {
            query: "SELECT * FROM c WHERE c.token = @token",
            parameters: [{ name: "@token", value: accessToken }],
        };

        const { resources: users } = await container.items.query<User>(query).fetchAll();
        if (users && users.length > 0) {
            context.currentUser = users[0]; // Attach the user to the context
            return; // Return to continue to the next function
        }

        // Return unauthorized if no user found
        return {
            status: 401,
            body: "Unauthorized! - Invalid token provided!",
        };
    } catch (error) {
        context.error(`Auth Middleware Error: ${error.message}`);
        return {
            status: 500,
            body: "Internal server error!",
        };
    }
};

// Higher-order function to wraps protected routes & handles auth flow
export const withAuth = (handler: (request: UserRequest, context: AuthenticatedContext) => Promise<HttpResponseInit>) => {
    return async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        const container = getContainer(databaseId, containerId);
        const authenticatedContext = context as AuthenticatedContext;

        // Run auth middleware
        const authResult = await authMiddleware(request, authenticatedContext, container);
        if (authResult) {
            return authResult; // Return if unauthorized
        }

        // Continue with handler if authorized
        try {
            return await handler(request as UserRequest, authenticatedContext);
        } catch (error) {
            return handleError(error, context);
        }
    };
};
