using AzureNet.Services;
using AzureNet.Config;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices(services =>
    {
        // Add cosmos DB connection
        services.AddSingleton<CosmosDBConnection>();

        // Add services
        services.AddScoped<TaskService>();
    })
    .Build();

host.Run();