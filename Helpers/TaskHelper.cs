using AzureNet.Models;

namespace AzureNet.Helpers
{
    public class TaskHelper
    {
        private static readonly string[] UpdatableTaskFields = { "Title", "Description", "DueDate", "Priority", "Status", "Tags", "UpdatedAt" };

        // Method to get a property value
        public static object? GetPropertyValue(object task, string propertyName)
        {
            return task.GetType().GetProperty(propertyName)?.GetValue(task);
        }

        // Method to get the changed fields
        public static Dictionary<string, object> GetChangedTaskFields(TaskModel existingTask, UpdateTaskRequest updateRequest)
        {
            var updates = new Dictionary<string, object>();

            foreach (var field in UpdatableTaskFields)
            {
                var existingValue = GetPropertyValue(existingTask, field);
                var newValue = GetPropertyValue(updateRequest, field);

                // Add to updates only if the new value is not null and different from existing
                if (newValue != null && !object.Equals(newValue, existingValue))
                {
                    updates[field] = newValue;
                }
            }
            return updates;
        }

    }
}