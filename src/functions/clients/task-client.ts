import { app, HttpHandler, HttpRequest, HttpResponse } from "@azure/functions";
import { AuthenticatedContext } from "../../model/user-model";
import { UserRequest } from "../../type/user-request";
import * as df from "durable-functions";
import { Task, TaskRequest } from "../../model/task-model";
import taskOrchestrator from "../ochestrators/task-orchestrator";
import { withAuth } from "../../middleware/auth-middleware";

const taskHttpStart: HttpHandler = async (request: UserRequest, context: AuthenticatedContext): Promise<HttpResponse> => {
    const client = df.getClient(context);

    const body = (await request.json()) as TaskRequest;
    // const instanceId: string = await client.startNew("taskOrchestrator", { input: body });
    // Optionally include authenticated user info in Orchestrator input
    const instanceId: string = await client.startNew("taskOrchestrator", {
        input: {
            ...body,
            user: context.currentUser, // Pass user info for traceability or processing
        },
    });

    context.log(`Started orchestration with ID = '${instanceId}'.`);

    return client.createCheckStatusResponse(request, instanceId);
};

app.http("durableTaskHttpStart", {
    route: "task-orchestrators",
    extraInputs: [df.input.durableClient()],
    handler: async (request: HttpRequest, context: AuthenticatedContext) => {
        return await withAuth(async (req: HttpRequest, ctx: AuthenticatedContext) => await taskHttpStart(req, ctx))(request, context);
    },
});
