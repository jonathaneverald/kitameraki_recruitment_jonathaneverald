using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace AzureNet.Models
{
    public class TaskModel
    {
        [JsonProperty(PropertyName = "id")]
        public string? Id { get; set; }

        [JsonProperty(PropertyName = "title")]
        public required string Title { get; set; }

        [JsonProperty(PropertyName = "description")]
        public string? Description { get; set; }

        [JsonProperty(PropertyName = "dueDate")]
        public DateTime? DueDate { get; set; }

        [JsonProperty(PropertyName = "priority")]
        [RegularExpression("low|medium|high", ErrorMessage = "Priority must be 'low', 'medium', or 'high'!")]
        public required string Priority { get; set; }

        [JsonProperty(PropertyName = "status")]
        [RegularExpression("todo|in-progress|completed", ErrorMessage = "Status must be 'todo', 'in-progress', or 'completed'!")]
        public required string Status { get; set; }

        [JsonProperty(PropertyName = "tags")]
        public List<string>? Tags { get; set; }

        [JsonProperty(PropertyName = "createdAt")]
        public DateTime? CreatedAt { get; set; }

        [JsonProperty(PropertyName = "updatedAt")]
        public DateTime? UpdatedAt { get; set; }

        [JsonProperty(PropertyName = "userId")]
        public string? UserId { get; set; }

        // [JsonProperty(PropertyName = "changes")]
        // public List<object>? Changes { get; set; }
    }

    public class UpdateTaskRequest
    {
        [JsonProperty(PropertyName = "title")]
        public string? Title { get; set; }

        [JsonProperty(PropertyName = "description")]
        public string? Description { get; set; }

        [JsonProperty(PropertyName = "dueDate")]
        public DateTime? DueDate { get; set; }

        [JsonProperty(PropertyName = "priority")]
        [RegularExpression("low|medium|high", ErrorMessage = "Priority must be 'low', 'medium', or 'high'!")]
        public string? Priority { get; set; }

        [JsonProperty(PropertyName = "status")]
        [RegularExpression("todo|in-progress|completed", ErrorMessage = "Status must be 'todo', 'in-progress', or 'completed'!")]
        public string? Status { get; set; }

        [JsonProperty(PropertyName = "tags")]
        public List<string>? Tags { get; set; }

        [JsonProperty(PropertyName = "updatedAt")]
        public DateTime? UpdatedAt { get; set; }
    }

    public class TaskChangeResponse
    {
        [JsonProperty(PropertyName = "field")]
        public string? Field { get; set; }
        [JsonProperty(PropertyName = "oldValue")]
        public string? OldValue { get; set; }
        [JsonProperty(PropertyName = "newValue")]
        public string? NewValue { get; set; }
    }

    public class UpdateTaskResponse
    {
        [JsonProperty(PropertyName = "updatedTask")]
        public TaskModel? UpdatedTask { get; set; }
        [JsonProperty(PropertyName = "changes")]
        public List<TaskChangeResponse>? Changes { get; set; }
    }

    public class TaskRequest
    {
        [JsonProperty(PropertyName = "title")]
        public required string Title { get; set; }

        [JsonProperty(PropertyName = "description")]
        public string? Description { get; set; }

        [JsonProperty(PropertyName = "dueDate")]
        public DateTime? DueDate { get; set; }

        [JsonProperty(PropertyName = "priority")]
        [RegularExpression("low|medium|high", ErrorMessage = "Priority must be 'low', 'medium', or 'high'!")]
        public required string Priority { get; set; }

        [JsonProperty(PropertyName = "status")]
        [RegularExpression("todo|in-progress|completed", ErrorMessage = "Status must be 'todo', 'in-progress', or 'completed'!")]
        public required string Status { get; set; }

        [JsonProperty(PropertyName = "tags")]
        public List<string>? Tags { get; set; }
    }

    public class TaskBatchRequest
    {
        [JsonProperty(PropertyName = "tasks")]
        public required List<TaskModel> Tasks { get; set; }
        [JsonProperty(PropertyName = "operation")]
        public required string Operation { get; set; }
    }
    public class TaskInput
    {

        public string? Id { get; set; }

        public string? Title { get; set; }

        public string? Description { get; set; }

        public DateTime? DueDate { get; set; }

        [RegularExpression("low|medium|high", ErrorMessage = "Priority must be 'low', 'medium', or 'high'!")]
        public string? Priority { get; set; }

        [RegularExpression("todo|in-progress|completed", ErrorMessage = "Status must be 'todo', 'in-progress', or 'completed'!")]
        public string? Status { get; set; }

        public List<string>? Tags { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public string? UserId { get; set; }

    }

    public class TaskActivityInput
    {
        [JsonProperty(PropertyName = "tasks")]
        public required List<TaskModel> Tasks { get; set; }
        [JsonProperty(PropertyName = "operation")]
        public required string Operation { get; set; }
        [JsonProperty(PropertyName = "userId")]
        public required string UserId { get; set; }
    }

    public class TaskOrchestratorInput
    {
        [JsonProperty(PropertyName = "tasks")]
        public required List<TaskModel> Tasks { get; set; }
        [JsonProperty(PropertyName = "operation")]
        public required string Operation { get; set; }
    }

    public class TaskOrchestratorResult
    {
        public int ProcessedBatches { get; set; }
        public List<object>? Results { get; set; }
    }
}
