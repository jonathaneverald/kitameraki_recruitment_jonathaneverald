using AzureNet.Models;

namespace AzureNet.Validators
{
    public class TaskValidator
    {
        public static List<string> ValidateTask(TaskModel task)
        {
            var errors = new List<string>();
            var validPriorities = new[] { "low", "medium", "high" };
            var validStatuses = new[] { "todo", "in-progress", "completed" };

            if (string.IsNullOrEmpty(task?.Title))
            {
                errors.Add("Title field is required.");
            }

            if (string.IsNullOrEmpty(task?.Priority))
            {
                errors.Add("Priority field is required.");
            }
            else if (!validPriorities.Contains(task.Priority.ToLower()))
            {
                errors.Add("Priority must be 'low', 'medium', or 'high'.");
            }

            if (string.IsNullOrEmpty(task?.Status))
            {
                errors.Add("Status field is required.");
            }
            else if (!validStatuses.Contains(task.Status.ToLower()))
            {
                errors.Add("Status must be 'todo', 'in-progress', or 'completed'.");
            }

            return errors;
        }

    }
}