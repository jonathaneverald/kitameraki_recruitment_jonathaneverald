using System.ComponentModel.DataAnnotations;
using System.Net;
using AzureNet.Config;
using AzureNet.Helpers;
using AzureNet.Models;
using AzureNet.ResponseHandlers;
using AzureNet.Validators;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace AzureNet.Services
{
    public class TaskService
    {
        private readonly Container _container;

        public TaskService(CosmosDBConnection cosmosConnection)
        {
            _container = cosmosConnection.GetDatabase("TaskManagementJo").GetContainer("Tasks");
        }

        public async Task<HttpResponseData> GetTasks(HttpRequestData request, FunctionContext context, string userId, string title, string status, string priority, int? size)
        {
            var logger = context.GetLogger("TaskService");

            try
            {
                var queryText = "SELECT * FROM c WHERE c.userId = @userId";
                var parameters = new List<(string name, string value)>{
                    ("@userId", userId)
                };

                // Add filters if provided
                if (!string.IsNullOrEmpty(title))
                {
                    queryText += " AND c.title = @title";
                    parameters.Add(("@title", title));
                }

                if (!string.IsNullOrEmpty(status))
                {
                    queryText += " AND c.status = @status";
                    parameters.Add(("@status", status));
                }

                if (!string.IsNullOrEmpty(priority))
                {
                    queryText += " AND c.priority = @priority";
                    parameters.Add(("@priority", priority));
                }

                // Create query definition with parameters
                var queryDefinition = new QueryDefinition(queryText);
                foreach (var param in parameters)
                {
                    queryDefinition.WithParameter(param.name, param.value);
                }

                var queryOptions = new QueryRequestOptions
                {
                    MaxItemCount = size ?? 10
                };

                // Get the continuation token from headers
                var continuationToken = request.Headers.TryGetValues("x-ms-continuation", out var token) ? token.FirstOrDefault() : null;

                var iterator = _container.GetItemQueryIterator<TaskModel>(queryDefinition, continuationToken, requestOptions: queryOptions);
                var tasks = await iterator.ReadNextAsync();

                var response = await TaskResponseHandler.CreateJsonResponse<object>(request, HttpStatusCode.OK, new
                {
                    message = "Tasks retrieved successfully",
                    tasks = tasks.Resource,
                    hasMoreResults = iterator.HasMoreResults,
                    continuationToken = tasks.ContinuationToken,
                });

                response.Headers.Add("x-ms-continuation", tasks.ContinuationToken);
                return response;
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos DB error: {ex.Message}");
                Console.WriteLine($"Status Code: {ex.StatusCode}");
                return await TaskResponseHandler.CreateErrorResponse(request, HttpStatusCode.InternalServerError, "Cosmos DB Connection Error!");
            }
            catch (Exception ex)
            {
                logger.LogError($"Error retrieving task: {ex.Message}");
                return await TaskResponseHandler.CreateErrorResponse(request, HttpStatusCode.InternalServerError, "Failed to retrieve task");
            }
        }

        public async Task<HttpResponseData> GetTaskByID(HttpRequestData request, FunctionContext context, string taskId, string userId)
        {
            var logger = context.GetLogger("TaskService");
            try
            {
                var existingTask = await CheckTaskExists(taskId, userId);
                return await TaskResponseHandler.CreateJsonResponse<object>(request, HttpStatusCode.OK, new
                {
                    message = "Task retrieved successfully",
                    success = true,
                    data = existingTask
                });
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos DB error: {ex.Message}");
                Console.WriteLine($"Status Code: {ex.StatusCode}");
                return await TaskResponseHandler.CreateErrorResponse(request, HttpStatusCode.InternalServerError, "Cosmos DB Connection Error!");
            }
            catch (Exception ex) when (ex.Message == "Task not found")
            {
                logger.LogError($"Error retrieving task: {ex.Message}");
                return await TaskResponseHandler.CreateErrorResponse(request, HttpStatusCode.NotFound, "Task not found!");
            }
            catch (Exception ex)
            {
                logger.LogError($"Error retrieving task: {ex.Message}");
                return await TaskResponseHandler.CreateErrorResponse(request, HttpStatusCode.InternalServerError, "Failed to retrieve task");
            }
        }

        public async Task<HttpResponseData> CreateTask(HttpRequestData request, FunctionContext context, string userId)
        {
            var logger = context.GetLogger("TaskService");
            try
            {
                var task = await request.ReadFromJsonAsync<TaskModel>();
                if (task == null)
                {
                    logger.LogError("Task deserialization failed - null result");
                    var badRequestResponse = request.CreateResponse(HttpStatusCode.BadRequest);
                    await badRequestResponse.WriteAsJsonAsync(new { error = "Invalid request body" });
                    return badRequestResponse;
                }
                task.Id = Guid.NewGuid().ToString();
                task.CreatedAt = DateTime.UtcNow;
                task.UpdatedAt = DateTime.UtcNow;
                task.UserId = userId;

                var validationResult = TaskValidator.ValidateTask(task!);
                if (validationResult.Count > 0)
                {
                    var httpResponse = request.CreateResponse(HttpStatusCode.BadRequest);
                    await httpResponse.WriteAsJsonAsync(new { success = false, errors = validationResult });
                    return httpResponse;
                }
                var container = _container;
                await container.CreateItemAsync(task, new PartitionKey(userId));

                return await TaskResponseHandler.CreateJsonResponse<object>(request, HttpStatusCode.Created,
                new
                {
                    message = "Task created successfully",
                    success = true,
                    data = task
                });
            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos DB error: {ex.Message}");
                Console.WriteLine($"Status Code: {ex.StatusCode}");
                return await TaskResponseHandler.CreateErrorResponse(request, HttpStatusCode.InternalServerError, "Cosmos DB Connection Error!");
            }
            catch (Exception ex)
            {
                logger.LogError($"Error creating task: {ex.Message}");

                return await TaskResponseHandler.CreateErrorResponse(request, HttpStatusCode.InternalServerError, "Failed to create task");
            }
        }

        public async Task<HttpResponseData> UpdateTask(HttpRequestData request, FunctionContext context, string taskId, string userId)
        {
            var logger = context.GetLogger("TaskService");
            try
            {
                var existingTask = await CheckTaskExists(taskId, userId);

                // Deserialize the update request
                var updateRequest = await request.ReadFromJsonAsync<UpdateTaskRequest>();
                if (updateRequest == null)
                {
                    return await TaskResponseHandler.CreateJsonResponse<object>(request, HttpStatusCode.BadRequest, "Invalid request body");
                }

                // Get the changed fields
                var updates = TaskHelper.GetChangedTaskFields(existingTask, updateRequest);
                if (!updates.Any())
                {
                    return await TaskResponseHandler.CreateJsonResponse<object>(request, HttpStatusCode.OK, new
                    {
                        message = "No changes detected",
                        success = true,
                        data = existingTask,
                        changes = new List<TaskChangeResponse>()
                    });
                }


                /// Create patch operations with camelCase property paths
                var patchOperations = updates.Select(update =>
                {
                    // Convert PascalCase to camelCase for the path
                    string camelCasePath = $"/{char.ToLowerInvariant(update.Key[0])}{update.Key.Substring(1)}";
                    return PatchOperation.Replace(camelCasePath, update.Value);
                }).ToList();

                // Always update UpdatedAt
                patchOperations.Add(PatchOperation.Replace("/updatedAt", DateTime.UtcNow));

                // Apply updates
                var response = await _container.PatchItemAsync<TaskModel>(
                    id: taskId,
                    partitionKey: new PartitionKey(userId),
                    patchOperations: patchOperations
                );

                // Track changes
                var changes = updates.Select(kvp => new TaskChangeResponse
                {
                    Field = kvp.Key,
                    OldValue = TaskHelper.GetPropertyValue(existingTask, kvp.Key)?.ToString() ?? "",
                    NewValue = kvp.Value?.ToString() ?? ""
                }).ToList();

                return await TaskResponseHandler.CreateJsonResponse<object>(request, HttpStatusCode.OK, new
                {
                    message = "Task updated successfully",
                    success = true,
                    data = response.Resource,
                    changes
                });

            }
            catch (CosmosException ex)
            {
                Console.WriteLine($"Cosmos DB error: {ex.Message}");
                Console.WriteLine($"Status Code: {ex.StatusCode}");
                return await TaskResponseHandler.CreateErrorResponse(request, HttpStatusCode.InternalServerError, "Cosmos DB Connection Error!");
            }
            catch (Exception ex) when (ex.Message == "Task not found")
            {
                logger.LogError($"Error updating task: {ex.Message}");
                return await TaskResponseHandler.CreateErrorResponse(request, HttpStatusCode.NotFound, "Task not found!");
            }
            catch (Exception ex)
            {
                logger.LogError($"Error updating task: {ex.Message}");
                return await TaskResponseHandler.CreateErrorResponse(request, HttpStatusCode.InternalServerError, "Failed to update task");
            }
        }

        public async Task<HttpResponseData> DeleteTask(HttpRequestData request, FunctionContext context, string taskId, string userId)
        {
            var logger = context.GetLogger("TaskService");
            try
            {
                // Check if task exist
                var task = await CheckTaskExists(taskId, userId);

                await _container.DeleteItemAsync<TaskModel>(
                    taskId,
                    new PartitionKey(userId)
                );

                return await TaskResponseHandler.CreateJsonResponse<object>(request, HttpStatusCode.OK,
                new
                {
                    message = "Task deleted successfully",
                    success = true,
                    data = task
                });
            }
            catch (Exception ex) when (ex.Message == "Task not found")
            {
                logger.LogError($"Error deleting task: {ex.Message}");

                return await TaskResponseHandler.CreateErrorResponse(request, HttpStatusCode.NotFound, "Task not found!");
            }
            catch (Exception ex)
            {
                logger.LogError($"Error deleting task: {ex.Message}");

                return await TaskResponseHandler.CreateErrorResponse(request, HttpStatusCode.InternalServerError, "Failed to delete tasks");
            }
        }

        // Method to check if a task exists
        private async Task<TaskModel> CheckTaskExists(string taskId, string userId)
        {
            try
            {
                var response = await _container.ReadItemAsync<TaskModel>(taskId, new PartitionKey(userId));
                return response.Resource;
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                throw new Exception("Task not found");
            }
        }

        // Methods to handle request from Activity (Durable functions)
        public async Task<TaskModel> CreateTaskActivity(TaskRequest taskRequest, FunctionContext context, string userId)
        {
            var logger = context.GetLogger("TaskService");
            try
            {
                if (taskRequest == null)
                {
                    logger.LogError("Task request is null");
                    throw new ArgumentNullException(nameof(taskRequest));
                }

                var task = new TaskModel
                {
                    Title = taskRequest.Title,
                    Description = taskRequest.Description,
                    DueDate = taskRequest.DueDate,
                    Priority = taskRequest.Priority,
                    Status = taskRequest.Status,
                    Tags = taskRequest.Tags,
                    Id = Guid.NewGuid().ToString(),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    UserId = userId
                };

                var validationResult = TaskValidator.ValidateTask(task);
                if (validationResult.Count > 0)
                {
                    throw new ValidationException($"Task validation failed: {string.Join(", ", validationResult)}");
                }

                var container = _container;
                await container.CreateItemAsync(task, new PartitionKey(userId));

                logger.LogInformation($"Task created successfully with id: {task.Id}");
                return task;
            }
            catch (CosmosException ex)
            {
                logger.LogError($"Cosmos DB error: {ex.Message}");
                logger.LogError($"Status Code: {ex.StatusCode}");
                throw;
            }
            catch (Exception ex)
            {
                logger.LogError($"Error creating task: {ex.Message}");
                throw;
            }
        }

        public async Task<TaskModel> UpdateTaskActivity(UpdateTaskRequest updateRequest, FunctionContext context, string taskId, string userId)
        {
            var logger = context.GetLogger("TaskService");
            try
            {
                // Check if task exists
                var existingTask = await CheckTaskExists(taskId, userId);

                if (updateRequest == null)
                {
                    throw new ArgumentNullException(nameof(updateRequest), "Update request cannot be null");
                }

                // Get the changed fields
                var updates = TaskHelper.GetChangedTaskFields(existingTask, updateRequest);
                if (!updates.Any())
                {
                    // Return existing task if no changes
                    return existingTask;
                }

                // Create patch operations with camelCase property paths
                var patchOperations = updates.Select(update =>
                {
                    // Convert PascalCase to camelCase for the path
                    string camelCasePath = $"/{char.ToLowerInvariant(update.Key[0])}{update.Key.Substring(1)}";
                    return PatchOperation.Replace(camelCasePath, update.Value);
                }).ToList();

                // Always update UpdatedAt
                patchOperations.Add(PatchOperation.Replace("/updatedAt", DateTime.UtcNow));

                // Apply updates
                var response = await _container.PatchItemAsync<TaskModel>(
                    id: taskId,
                    partitionKey: new PartitionKey(userId),
                    patchOperations: patchOperations
                );

                logger.LogInformation($"Task updated successfully: {taskId}");
                return response.Resource;
            }
            catch (CosmosException ex)
            {
                logger.LogError($"Cosmos DB error: {ex.Message}");
                logger.LogError($"Status Code: {ex.StatusCode}");
                throw;
            }
            catch (Exception ex) when (ex.Message == "Task not found")
            {
                logger.LogError($"Error updating task: {ex.Message}");
                throw;
            }
            catch (Exception ex)
            {
                logger.LogError($"Error updating task: {ex.Message}");
                throw;
            }
        }

        public async Task<TaskModel> DeleteTaskActivity(FunctionContext context, string taskId, string userId)
        {
            var logger = context.GetLogger("TaskService");
            try
            {
                // Check if task exists (this will throw an exception if not found)
                var task = await CheckTaskExists(taskId, userId);

                // Delete the task
                await _container.DeleteItemAsync<TaskModel>(
                    taskId,
                    new PartitionKey(userId)
                );

                logger.LogInformation($"Task deleted successfully: {taskId}");
                return task; // Return the deleted task information
            }
            catch (Exception ex) when (ex.Message == "Task not found")
            {
                logger.LogError($"Error deleting task: {ex.Message}");
                throw; // Rethrow to maintain the same error handling pattern
            }
            catch (Exception ex)
            {
                logger.LogError($"Error deleting task: {ex.Message}");
                throw; // Rethrow so calling code can handle specific errors
            }
        }

    }
}