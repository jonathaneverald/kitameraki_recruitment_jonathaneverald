using AzureNet.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace AzureNet.Functions
{
    public class TaskFunction(TaskService taskService)
    {
        private readonly TaskService _taskService = taskService;
        // For testing hardcode a value
        private readonly string userId = "38c7e674-2a2c-4989-99b5-df547c8a714b";

        [Function("GetTasks")]
        public async Task<HttpResponseData> GetTasks(
            [HttpTrigger(AuthorizationLevel.Function, "get", Route = "tasks")] HttpRequestData req,
            FunctionContext executionContext)
        {
            var title = req.Query["title"] ?? "";
            var status = req.Query["status"] ?? "";
            var priority = req.Query["priority"] ?? "";
            // Parse size parameter with proper integer conversion
            int? size = null;
            string sizeStr = req.Query["size"] ?? "";
            if (!string.IsNullOrEmpty(sizeStr) && int.TryParse(sizeStr, out int parsedSize))
            {
                size = parsedSize;
            }
            return await _taskService.GetTasks(req, executionContext, userId, title, status, priority, size);
        }

        [Function("GetTasksByID")]
        public async Task<HttpResponseData> GetTaskByID(
            [HttpTrigger(AuthorizationLevel.Function, "get", Route = "tasks/{taskId}")] HttpRequestData req,
            FunctionContext executionContext, string taskId)
        {
            return await _taskService.GetTaskByID(req, executionContext, taskId, userId);
        }

        [Function("CreateTask")]
        public async Task<HttpResponseData> CreateTask(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = "tasks")] HttpRequestData req,
            FunctionContext executionContext)
        {
            return await _taskService.CreateTask(req, executionContext, userId);
        }

        [Function("UpdateTask")]
        public async Task<HttpResponseData> UpdateTask(
            [HttpTrigger(AuthorizationLevel.Function, "put", Route = "tasks/{taskId}")] HttpRequestData req,
            FunctionContext executionContext, string taskId)
        {
            return await _taskService.UpdateTask(req, executionContext, taskId, userId);
        }


        [Function("DeleteTask")]
        public async Task<HttpResponseData> DeleteTask(
            [HttpTrigger(AuthorizationLevel.Function, "delete", Route = "tasks/{taskId}")] HttpRequestData req,
            FunctionContext executionContext, string taskId)
        {
            return await _taskService.DeleteTask(req, executionContext, taskId, userId);
        }


    }
}