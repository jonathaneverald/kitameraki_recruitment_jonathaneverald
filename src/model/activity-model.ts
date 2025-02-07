import { Task } from "./task-model";

export type ActivityLog = {
    id?: string;
    action?: string;
    userId: string;
    changes: {}[] | [];
    task?: Task;
    timestamp: string;
};
