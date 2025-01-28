import { getContainer } from "../database/cosmosClient";

const databaseId = "TaskManagementJo";
const conteinerId = "ActivityLog";

const container = getContainer(databaseId, conteinerId);

export class ActivityService {}
