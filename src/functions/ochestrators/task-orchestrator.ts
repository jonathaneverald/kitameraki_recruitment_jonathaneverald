import { OrchestrationContext, OrchestrationHandler } from "durable-functions";
import * as df from "durable-functions";
import { Task, TaskRequest } from "../../model/task-model";
import { TaskActivityInput } from "../activities/task-activity";
import { currentUser, User } from "../../model/user-model";

const taskOrchestrator: OrchestrationHandler = function* (context: OrchestrationContext) {
    const input = context.df.getInput() as { tasks: TaskRequest[]; operation: string; user: currentUser };

    // Add validation for empty input
    if (!input.tasks || input.tasks.length === 0) {
        return {
            processedBatches: 0,
            results: [],
        };
    }

    // Split the tasks into batches
    const batchSize = 2;
    const taskBatches = splitTasks(input.tasks, batchSize);

    // Process the tasks
    const batchResults = yield context.df.Task.all(
        taskBatches.map((batch) =>
            context.df.callActivity("taskActivity", {
                tasks: batch,
                operation: input.operation,
                user: input.user, // Pass the user to the Activity
            } as TaskActivityInput & { user: currentUser })
        )
    );

    return {
        processedBatches: batchResults.length,
        results: batchResults.flat(),
    };
};

function splitTasks<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

df.app.orchestration("taskOrchestrator", taskOrchestrator);

export default taskOrchestrator;
