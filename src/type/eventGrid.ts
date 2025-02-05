import { Task } from "../model/task-model";

export const EVENT_TYPES = {
    TASK_CREATED: "Task.Created",
    TASK_UPDATED: "Task.Updated",
    TASK_DELETED: "Task.Deleted",
};

export type eventData = {
    id: string;
    topic: string;
    subject: string;
    eventType: string;
    eventTime: string;
    data: {
        action: "create" | "update" | "delete";
        changes?: [
            {
                field: string;
                newValue: string;
            }
        ];
        task: Task; // task data
    };
    dataVersion: string;
    metadataVersion: string;
};

export type cloudEventData = {
    id: string;
    type: string;
    source: string;
    subject: string;
    time: Date;
    comexampleextension1: string;
    comexampleothervalue: number;
    datacontenttype: string;
    data: {
        action: "create" | "update" | "delete";
        changes?: [
            {
                field: string;
                newValue: string;
            }
        ];
        task: Task; // task data
    };
};
