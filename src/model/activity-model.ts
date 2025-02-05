import { Task } from "./task-model";

export type Activity = {
    id?: string;
    action: string;
    userId: string;
    changes?: [];
    task?: Task;
    timestamp: string;
};

// export type CreateActivityRequest = Activity & {
//     newTask: Task;
// };

// export type UpdateActivityRequest = Activity & {
//     oldTask: Task;
//     changes: {
//         field: keyof Task;
//         newValue: any;
//     }[];
// };
