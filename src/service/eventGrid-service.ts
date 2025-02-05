import { EventGridPublisherClient, AzureKeyCredential } from "@azure/eventgrid";
import { Activity } from "../model/activity-model";
import config from "../config/environment";

export class EventGridService {
    static async publishEvent(eventType: string, data: Activity) {
        const endpoint = config.eventgrid_endpoint;
        const accessKey = config.eventgrid_access_key;
        const client = new EventGridPublisherClient(endpoint, "EventGrid", new AzureKeyCredential(accessKey));

        const events = [
            {
                eventType: eventType,
                dataVersion: "1.0",
                subject: "x",
                data: data.task ? JSON.parse(JSON.stringify(data.task)) : null,
                eventTime: new Date(),
            },
        ];

        console.log("Client: ", client);
        console.log("Events: ", events);
        try {
            const send = await client.send(events);
            console.log("Sent: ", send);
            console.log("Published event successfully");
        } catch (error) {
            console.error("Error publishing event:", error);
            throw error;
        }
    }
}
