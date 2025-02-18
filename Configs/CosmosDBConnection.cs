using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Fluent;

namespace AzureNet.Config
{
    public class CosmosDBConnection
    {
        private readonly CosmosClient _cosmosClient;

        public CosmosDBConnection()
        {
            var cosmosDBConnectionString = Environment.GetEnvironmentVariable("CosmosDBConnectionString");
            // Console.WriteLine($"Connection String: {cosmosDBConnectionString}");
            _cosmosClient = new CosmosClientBuilder(cosmosDBConnectionString).WithBulkExecution(true).Build();
        }
        public CosmosClient CosmosClient()
        {
            return _cosmosClient;
        }

        public Database GetDatabase(string databaseId)
        {
            return _cosmosClient.GetDatabase(databaseId);
        }

        public Container GetContainer(string databaseId, string containerId)
        {
            return _cosmosClient.GetContainer(databaseId, containerId);
        }
    }
}