import { app, EventGridEvent, InvocationContext, EventGridHandler } from "@azure/functions";
import { cloudEventData, EVENT_TYPES } from "../type/eventGrid";
import { AuthenticatedContext } from "../model/user-model";
import { ActivityService } from "../service/activity-service";
import { ActivityLog } from "../model/activity-model";

export async function taskEventGridTrigger(event: EventGridEvent, context: AuthenticatedContext): Promise<void> {
    context.log("Event grid function processed event:", event);
    console.log("Event grid function processed event:", event);

    try {
        switch (event.eventType) {
            case EVENT_TYPES.TASK_CREATED:
                // handle task created
                handleTaskCreated(event.data as ActivityLog);
                break;
            case EVENT_TYPES.TASK_UPDATED:
                handleTaskUpdated(event.data as ActivityLog);
                break;
            case EVENT_TYPES.TASK_DELETED:
                // handle task deleted
                handleTaskDeleted(event.data as ActivityLog);
                break;
            default:
                console.warn(`Unhandled event type: ${event.eventType}`);
        }
    } catch (error) {
        console.error("Error processing event:", error);
        throw error;
    }
}

async function handleTaskCreated(data: ActivityLog) {
    console.log("New task created:", data);
    // handle log
    const activity = await ActivityService.create(data, data.task.userId);
    console.log("Activity log created:", activity);
    return;
}

async function handleTaskUpdated(data: ActivityLog) {
    console.log("Updated task: ", data);
    const activity = await ActivityService.create(data, data.task.userId);
}

async function handleTaskDeleted(data: ActivityLog) {
    console.log("Deleted task: ", data);
    const activity = await ActivityService.create(data, data.task.userId);
}

app.eventGrid("taskEventGridTrigger", {
    handler: taskEventGridTrigger,
});
