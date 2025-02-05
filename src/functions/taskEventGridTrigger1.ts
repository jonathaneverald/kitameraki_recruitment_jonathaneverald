import { app, EventGridEvent, InvocationContext, EventGridHandler } from "@azure/functions";
import { cloudEventData, EVENT_TYPES } from "../type/eventGrid";
import { AuthenticatedContext } from "../model/user-model";
import { ActivityService } from "../service/activity-service";
import { Activity } from "../model/activity-model";
import { CloudEvent } from "@azure/eventgrid";

export async function taskEventGridTrigger(event: EventGridEvent, context: AuthenticatedContext): Promise<void> {
    context.log("Event grid function processed event:", event);
    console.log("Event grid function processed event:", event);

    try {
        switch (event.eventType) {
            case EVENT_TYPES.TASK_CREATED:
                // handle task created
                handleTaskCreated(event.data as Activity, context);
                break;
            case EVENT_TYPES.TASK_UPDATED:
                // handle task updated
                break;
            case EVENT_TYPES.TASK_DELETED:
                // handle task deleted
                break;
            default:
                console.warn(`Unhandled event type: ${event.eventType}`);
        }
    } catch (error) {
        console.error("Error processing event:", error);
        throw error;
    }
}

async function handleTaskCreated(data: Activity, context: AuthenticatedContext) {
    console.log("New task created:", data);
    // handle log
    const activity = await ActivityService.create(data, context.currentUser);
    console.log("Activity log created:", activity);
    return;
}

app.eventGrid("taskEventGridTrigger", {
    handler: taskEventGridTrigger,
});
