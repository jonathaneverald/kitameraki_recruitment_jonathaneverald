import { HttpResponseInit, InvocationContext } from "@azure/functions";
import { ResponseError } from "./response-error";

export const handleError = (error: any, context: InvocationContext): HttpResponseInit => {
    context.log("Error:", error);

    if (error instanceof ResponseError) {
        const responseBody: any = { message: error.message };
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
        body: JSON.stringify({ message: "Internal server error" }),
        headers: {
            "Content-Type": "application/json",
        },
    };
};
