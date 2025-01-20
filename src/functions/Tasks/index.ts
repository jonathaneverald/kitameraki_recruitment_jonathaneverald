import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { TaskService } from "../../service/task-service";

const getTask = async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
        context.log(`Http function processed request for url "${request.url}"`);
        const tasks = await TaskService.getAllTasks();
        return {
            status: 200,
            body: JSON.stringify(tasks),
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (error) {
        context.log("Error fetching tasks:", error);
        return {
            status: 500,
            body: "Error fetching tasks",
            headers: {
                "Content-Type": "application/json",
            },
        };
    }
};

app.http("tasks", {
    methods: ["GET"],
    authLevel: "anonymous",
    handler: getTask,
});
