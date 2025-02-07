import { app, EventGridEvent } from "@azure/functions";
import { AuthenticatedContext } from "../model/user-model";
import { ActivityService } from "../service/activity-service";
import { ActivityLog } from "../model/activity-model";

export async function taskEventGridTrigger(event: EventGridEvent, context: AuthenticatedContext): Promise<void> {
    context.log("Event grid function processed event:", event);

    try {
        const activityLog = event.data as ActivityLog;
        context.log(`Processing ${event.eventType}:`, activityLog);

        const activity = await ActivityService.create(activityLog, activityLog.task.userId);
        context.log("Activity log created:", activity);
    } catch (error) {
        console.error("Error processing event:", error);
        throw error;
    }
}

app.eventGrid("taskEventGridTrigger", {
    handler: taskEventGridTrigger,
});
