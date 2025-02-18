using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using AzureNet.Models;
using AzureNet.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.DurableTask;
using Microsoft.DurableTask.Client;
using Microsoft.Extensions.Logging;

namespace AzureNet.Functions
{
    public static class DurableFunctionsOrchestrationCSharp1
    {
        // Orchestration
        [Function(nameof(DurableFunctionsOrchestrationCSharp1))]
        public static async Task<List<string>> RunOrchestrator(
            [OrchestrationTrigger] TaskOrchestrationContext context)
        {
            ILogger logger = context.CreateReplaySafeLogger(nameof(DurableFunctionsOrchestrationCSharp1));
            logger.LogInformation("Saying hello.");
            var outputs = new List<string>();

            // Replace name and input with values relevant for your Durable Functions Activity
            outputs.Add(await context.CallActivityAsync<string>(nameof(SayHello), "Tokyo"));
            outputs.Add(await context.CallActivityAsync<string>(nameof(SayHello), "Seattle"));
            outputs.Add(await context.CallActivityAsync<string>(nameof(SayHello), "London"));

            // returns ["Hello Tokyo!", "Hello Seattle!", "Hello London!"]
            return outputs;
        }

        // Activity
        [Function(nameof(SayHello))]
        public static string SayHello([ActivityTrigger] string name, FunctionContext executionContext)
        {
            ILogger logger = executionContext.GetLogger("SayHello");
            logger.LogInformation("Saying hello to {name}.", name);
            return $"Hello {name}!";
        }

        // Client
        [Function("DurableFunctionsOrchestrationCSharp1_HttpStart")]
        public static async Task<HttpResponseData> HttpStart(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequestData req,
            [DurableClient] DurableTaskClient client,
            FunctionContext executionContext)
        {
            ILogger logger = executionContext.GetLogger("DurableFunctionsOrchestrationCSharp1_HttpStart");

            // Function input comes from the request content.
            string instanceId = await client.ScheduleNewOrchestrationInstanceAsync(
                nameof(DurableFunctionsOrchestrationCSharp1));

            logger.LogInformation("Started orchestration with ID = '{instanceId}'.", instanceId);

            // Returns an HTTP 202 response with an instance management payload.
            // See https://learn.microsoft.com/azure/azure-functions/durable/durable-functions-http-api#start-orchestration
            return await client.CreateCheckStatusResponseAsync(req, instanceId);
        }
    }

    public class TaskDurableFunctionsOrchestration(TaskService taskService)
    {
        private readonly TaskService _taskService = taskService;
        // For testing hardcode a value
        private readonly string userId = "38c7e674-2a2c-4989-99b5-df547c8a714b";

        // Method to split the tasks batch
        private static List<List<T>> SplitTasks<T>(List<T> items, int batchSize)
        {
            var result = new List<List<T>>();
            for (int i = 0; i < items.Count; i += batchSize)
            {
                result.Add(items.Skip(i).Take(batchSize).ToList());
            }
            return result;
        }

        // Orchestrator
        [Function(nameof(TaskDurableFunctionsOrchestration))]
        public async Task<TaskOrchestratorResult> RunOrchestrator(
            [OrchestrationTrigger] TaskOrchestrationContext context)
        {
            ILogger logger = context.CreateReplaySafeLogger(nameof(TaskDurableFunctionsOrchestration));
            var input = context.GetInput<TaskOrchestratorInput>();

            try
            {
                logger.LogInformation($"Received input in orchestrator. Operation: {input?.Operation}");
                logger.LogInformation($"Number of tasks: {input?.Tasks?.Count ?? 0}");

                // Add validation for empty input
                if (input?.Tasks == null || input.Tasks.Count == 0)
                {
                    logger.LogWarning("No tasks provided in the input");
                    return new TaskOrchestratorResult
                    {
                        ProcessedBatches = 0,
                        Results = new List<object>()
                    };
                }

                // Split the tasks into batches
                int batchSize = 2;
                var taskBatches = SplitTasks(input.Tasks, batchSize);
                logger.LogInformation($"Split tasks into {taskBatches.Count} batches");

                // Process the tasks
                var batchTaskActivities = new List<Task<List<object>>>();
                foreach (var batch in taskBatches)
                {
                    batchTaskActivities.Add(context.CallActivityAsync<List<object>>("ProcessTaskBatch",
                    new TaskActivityInput
                    {
                        Tasks = batch,
                        Operation = input.Operation,
                        UserId = batch.FirstOrDefault()?.UserId ?? string.Empty
                    }));
                }

                var batchResults = await Task.WhenAll(batchTaskActivities);
                logger.LogInformation($"Processed {batchResults.Length} batches successfully");

                return new TaskOrchestratorResult
                {
                    ProcessedBatches = batchResults.Length,
                    Results = batchResults.SelectMany(r => r).ToList()
                };
            }
            catch (Exception ex)
            {
                logger.LogError($"Error in orchestrator: {ex.Message}");
                throw; // Rethrow to maintain the error details
            }

            // // Add validation for empty input
            // if (input?.Tasks == null || input.Tasks.Count == 0)
            // {
            //     return new TaskOrchestratorResult
            //     {
            //         ProcessedBatches = 0,
            //         Results = new List<object>()
            //     };
            // }

            // // Split the tasks into batches
            // int batchSize = 2;
            // var taskBatches = SplitTasks(input.Tasks, batchSize);
            // Console.WriteLine($"Task batches: {taskBatches}");

            // // Process the tasks
            // var batchTaskActivities = new List<Task<List<object>>>();
            // foreach (var batch in taskBatches)
            // {
            //     batchTaskActivities.Add(context.CallActivityAsync<List<object>>("TaskActivity",
            //     new TaskActivityInput
            //     {
            //         Tasks = batch,
            //         Operation = input.Operation,
            //         UserId = userId,
            //     }));
            // }

            // var batchResults = await Task.WhenAll(batchTaskActivities);
            // Console.WriteLine($"Batch Results: {batchResults}");

            // return new TaskOrchestratorResult
            // {
            //     ProcessedBatches = batchResults.Length,
            //     Results = batchResults.SelectMany(r => r).ToList()
            // };
        }

        // Activity
        [Function(nameof(ProcessTaskBatch))]
        public async Task<List<string>> ProcessTaskBatch(
            [ActivityTrigger] TaskActivityInput input,
            FunctionContext executionContext)
        {
            ILogger logger = executionContext.GetLogger("ProcessTaskBatch");
            var results = new List<string>();

            foreach (var task in input.Tasks)
            {
                var taskRequest = new TaskRequest
                {
                    Title = task.Title,
                    Description = task.Description,
                    DueDate = task.DueDate,
                    Priority = task.Priority,
                    Status = task.Status,
                    Tags = task.Tags,
                };

                try
                {
                    if (input.Operation == "create")
                    {
                        var createdTask = await _taskService.CreateTaskActivity(taskRequest, executionContext, userId);
                        results.Add($"Created task: {task.Title}");
                    }
                    else if (input.Operation == "update" && !string.IsNullOrEmpty(task.Id))
                    {
                        var updateRequest = new UpdateTaskRequest
                        {
                            Title = task.Title,
                            Description = task.Description,
                            DueDate = task.DueDate,
                            Priority = task.Priority,
                            Status = task.Status,
                            Tags = task.Tags
                        };
                        var updatedTask = await _taskService.UpdateTaskActivity(updateRequest, executionContext, task.Id, userId);
                        results.Add($"Updated task: {task.Title} with ID: {task.Id}");
                    }
                    else if (input.Operation == "delete" && !string.IsNullOrEmpty(task.Id))
                    {
                        var deletedTask = await _taskService.DeleteTaskActivity(executionContext, task.Id, userId);
                        results.Add($"Deleted task: {deletedTask.Title} with ID: {task.Id}");
                    }

                }
                catch (Exception ex)
                {
                    logger.LogError(ex, $"Error processing task {task.Title}");
                    results.Add($"Error processing task {task.Title}: {ex.Message}");
                }
            }
            return results;
        }

        // Client
        [Function("TaskDurableFunctionsOrchestration_HttpStart")]
        public async Task<HttpResponseData> HttpStart(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "task-orchestrators")] HttpRequestData req,
            [DurableClient] DurableTaskClient client,
            FunctionContext executionContext)
        {
            ILogger logger = executionContext.GetLogger("TaskDurableFunctionsOrchestration_HttpStart");
            try
            {
                // Parse the request body to get the task details
                var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                Console.WriteLine($"Request Body: {requestBody}");
                // Use JsonSerializerOptions to handle required properties
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
                };

                var taskBatchRequest = JsonSerializer.Deserialize<TaskBatchRequest>(requestBody, options);

                if (taskBatchRequest?.Tasks == null || !taskBatchRequest.Tasks.Any())
                {
                    logger.LogError("Invalid task request received - tasks array is empty or null");
                    var response = req.CreateResponse(HttpStatusCode.BadRequest);
                    await response.WriteStringAsync("Invalid task request - tasks array is required");
                    return response;
                }

                // Validate required properties for each task
                foreach (var task in taskBatchRequest.Tasks)
                {
                    if (string.IsNullOrEmpty(task.Title) ||
                        string.IsNullOrEmpty(task.Priority) ||
                        string.IsNullOrEmpty(task.Status))
                    {
                        logger.LogError($"Invalid task data - missing required properties");
                        var response = req.CreateResponse(HttpStatusCode.BadRequest);
                        await response.WriteStringAsync("Each task must have Title, Priority, and Status");
                        return response;
                    }

                    // Validate Priority
                    if (!new[] { "low", "medium", "high" }.Contains(task.Priority.ToLower()))
                    {
                        var response = req.CreateResponse(HttpStatusCode.BadRequest);
                        await response.WriteStringAsync("Priority must be 'low', 'medium', or 'high'");
                        return response;
                    }

                    // Validate Status
                    if (!new[] { "todo", "in-progress", "completed" }.Contains(task.Status.ToLower()))
                    {
                        var response = req.CreateResponse(HttpStatusCode.BadRequest);
                        await response.WriteStringAsync("Status must be 'todo', 'in-progress', or 'completed'");
                        return response;
                    }
                }

                var orchestratorInput = new TaskOrchestratorInput
                {
                    Tasks = taskBatchRequest.Tasks,
                    Operation = taskBatchRequest.Operation
                };

                string instanceId = await client.ScheduleNewOrchestrationInstanceAsync(
                    nameof(TaskDurableFunctionsOrchestration),
                    orchestratorInput);

                logger.LogInformation("Started task orchestration with ID = '{instanceId}'.", instanceId);

                return await client.CreateCheckStatusResponseAsync(req, instanceId);
            }
            catch (Exception ex)
            {
                logger.LogError($"Error starting task orchestration: {ex.Message}");
                var response = req.CreateResponse(HttpStatusCode.BadRequest);
                await response.WriteStringAsync($"Error: {ex.Message}");
                return response;
            }
        }
    }

}
