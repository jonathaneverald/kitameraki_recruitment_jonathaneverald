import { app, HttpHandler, HttpRequest, HttpResponse, InvocationContext } from "@azure/functions";
import * as df from "durable-functions";
import { ActivityHandler, OrchestrationContext, OrchestrationHandler } from "durable-functions";

const activityName = "durableHello1";

// Orchestrator function
const durableHello1Orchestrator: OrchestrationHandler = function* (context: OrchestrationContext) {
    const outputs = [];
    const userInput = (context.df.getInput() as { name?: string }) || {};
    const cityName = userInput.name;

    outputs.push(yield context.df.callActivity(activityName, "Tokyo"));
    outputs.push(yield context.df.callActivity(activityName, "Cairo"));
    outputs.push(yield context.df.callActivity(activityName, "Seattle"));
    outputs.push(yield context.df.callActivity(activityName, "Yogyakarta"));
    outputs.push(yield context.df.callActivity(activityName, cityName));
    console.log("INPUTS", cityName);

    return outputs;
};
df.app.orchestration("durableHello1Orchestrator", durableHello1Orchestrator);

// Activity function
const durableHello1: ActivityHandler = (input: string): string => {
    return `Hello, ${input}`;
};
df.app.activity(activityName, { handler: durableHello1 });

// Client function
const durableHello1HttpStart: HttpHandler = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponse> => {
    const client = df.getClient(context);
    const body: unknown = await request.json();
    const instanceId: string = await client.startNew(request.params.orchestratorName, { input: body });

    context.log(`Started orchestration with ID = '${instanceId}'.`);

    return client.createCheckStatusResponse(request, instanceId);
};

app.http("durableHello1HttpStart", {
    route: "orchestrators/{orchestratorName}",
    extraInputs: [df.input.durableClient()],
    handler: durableHello1HttpStart,
});
