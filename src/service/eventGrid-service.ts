import { EventGridPublisherClient, AzureKeyCredential } from "@azure/eventgrid";
import { ActivityLog } from "../model/activity-model";
import config from "../config/environment";
import { Task } from "../model/task-model";

export class EventGridService {
    static async createEvent(eventType: string, data: ActivityLog) {
        const endpoint = config.eventgrid_endpoint;
        const accessKey = config.eventgrid_access_key;
        const client = new EventGridPublisherClient(endpoint, "EventGrid", new AzureKeyCredential(accessKey));

        const events = [
            {
                eventType: eventType,
                dataVersion: "1.0",
                subject: "x",
                data: data ? JSON.parse(JSON.stringify(data)) : null,
                eventTime: new Date(),
            },
        ];
        try {
            const send = await client.send(events);
            console.log("Published event successfully");
        } catch (error) {
            console.error("Error publishing event:", error);
            throw error;
        }
    }

    static async publishEvent(action: string, eventType: string, userId: string, task: Task, changes: {}[]) {
        const eventData: ActivityLog = {
            action: action,
            userId: userId,
            task: task,
            changes: changes,
            timestamp: new Date().toISOString(),
        };
        await this.createEvent(eventType, eventData);
    }
}
