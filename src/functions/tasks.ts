import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import { TaskService } from "../service/task-service";
import { AuthenticatedContext } from "../model/user-model";
import { CreateTaskRequest, SearchTaskRequest, UpdateTaskRequest } from "../model/task-model";
import { handleError } from "../error/error-handler";
import { withAuth } from "../middleware/auth-middleware";
import { EventGridService } from "../service/eventGrid-service";

const getTaskDetail = async (request: HttpRequest, context: AuthenticatedContext, id: string): Promise<HttpResponseInit> => {
    try {
        context.log(`Http function processed request for url "${request.url}"`);
        const task = await TaskService.getTaskDetail(context.currentUser, id);
        return {
            status: 200,
            body: JSON.stringify(task),
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (error) {
        context.log("Error showing task:", error);
        return handleError(error, context);
    }
};

const createTask = async (request: HttpRequest, context: AuthenticatedContext): Promise<HttpResponseInit> => {
    try {
        context.log(`Http function processed request for url "${request.url}"`);
        const createTaskRequest = (await request.json()) as CreateTaskRequest;
        const task = await TaskService.create(context.currentUser, createTaskRequest);
        // call publish event here
        const eventData = {
            action: "create",
            userId: context.currentUser.id,
            task: task,
            timestamp: new Date().toISOString(),
        };
        const publishEvent = await EventGridService.publishEvent("Task.Created", eventData);
        console.log("Published event:", publishEvent);
        return {
            status: 201,
            body: JSON.stringify(task),
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (error) {
        context.log("Error creating task:", error);
        return handleError(error, context);
    }
};

const updateTask = async (request: HttpRequest, context: AuthenticatedContext, id: string): Promise<HttpResponseInit> => {
    try {
        const updateTaskRequest = (await request.json()) as UpdateTaskRequest;
        const task = await TaskService.update(context.currentUser, updateTaskRequest, id);
        return {
            status: 200,
            body: JSON.stringify(task),
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (error) {
        context.log("Error updating task:", error);
        return handleError(error, context);
    }
};

const getTasks = async (request: HttpRequest, context: AuthenticatedContext): Promise<HttpResponseInit> => {
    try {
        const searchRequest: SearchTaskRequest = {
            page: Number(request.query.get("page")) || 1,
            size: Number(request.query.get("size")) || 5,
        };
        // Only add filters if they are provided in the query
        const title = request.query.get("title");
        if (title) {
            searchRequest.title = title;
        }

        const priority = request.query.get("priority");
        if (priority) {
            searchRequest.priority = priority as "low" | "medium" | "high";
        }

        const status = request.query.get("status");
        if (status) {
            searchRequest.status = status as "todo" | "in-progress" | "completed";
        }

        const task = await TaskService.getTasks(context.currentUser, searchRequest);
        return {
            status: 200,
            body: JSON.stringify(task),
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (error) {
        context.log("Error showing tasks:", error);
        return handleError(error, context);
    }
};

const deleteTask = async (request: HttpRequest, context: AuthenticatedContext, id: string): Promise<HttpResponseInit> => {
    try {
        const task = await TaskService.delete(context.currentUser, id);
        return {
            status: 200,
            body: JSON.stringify(task),
            headers: {
                "Content-Type": "application/json",
            },
        };
    } catch (error) {
        context.log("Error deleting task:", error);
        return handleError(error, context);
    }
};

app.http("tasks", {
    methods: ["GET", "POST"],
    authLevel: "anonymous",
    route: "tasks",
    handler: async (request: HttpRequest, context: AuthenticatedContext) => {
        if (request.method === "GET") {
            return await withAuth(async (req: HttpRequest, ctx: AuthenticatedContext) => await getTasks(req, ctx))(request, context);
        } else if (request.method === "POST") {
            return await withAuth(async (req: HttpRequest, ctx: AuthenticatedContext) => await createTask(req, ctx))(request, context);
        }
    },
});

app.http("tasks-detail", {
    methods: ["PUT", "GET", "DELETE"],
    authLevel: "anonymous",
    route: "tasks/{id}",
    handler: async (request: HttpRequest, context: AuthenticatedContext) => {
        if (request.method === "GET") {
            return await withAuth(async (req: HttpRequest, ctx: AuthenticatedContext) => await getTaskDetail(req, ctx, req.params.id))(request, context);
        } else if (request.method === "PUT") {
            return await withAuth(async (req: HttpRequest, ctx: AuthenticatedContext) => await updateTask(req, ctx, req.params.id))(request, context);
        } else if (request.method === "DELETE") {
            return await withAuth(async (req: HttpRequest, ctx: AuthenticatedContext) => await deleteTask(req, ctx, req.params.id))(request, context);
        }
    },
});
