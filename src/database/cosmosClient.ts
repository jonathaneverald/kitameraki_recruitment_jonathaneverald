import { CosmosClient } from "@azure/cosmos";
import config from "../config/environment";

const cosmosDBConnectionString = config.db;

const client = new CosmosClient(cosmosDBConnectionString);

export const getDatabase = (databaseId: string) => client.database(databaseId);
export const getContainer = (databaseId: string, containerId: string) => client.database(databaseId).container(containerId);

// export const connectDB = async (context: any) => {
//     try {
//         const { database } = await client.databases.createIfNotExists({
//             id: "TaskManagementJo",
//         });

//         const { container } = await database.containers.createIfNotExists({
//             id: "Tasks",
//             partitionKey: { paths: ["/task_id"] },
//         });

//         context.log("Succesfully connected to CosmosDB");
//     } catch (error) {
//         context.log.error("Could not connect to CosmosDB", error);
//         process.exit(1);
//     }
// };
