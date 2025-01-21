import { CosmosClient } from "@azure/cosmos";
import config from "../config/environment";

const cosmosDBConnectionString = config.db;

const client = new CosmosClient(cosmosDBConnectionString);

export const getDatabase = (databaseId: string) => client.database(databaseId);
export const getContainer = (databaseId: string, containerId: string) => client.database(databaseId).container(containerId);
