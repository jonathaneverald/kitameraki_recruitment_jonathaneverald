using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker.Http;

namespace AzureNet.ResponseHandlers
{
    public class TaskResponseHandler
    {
        private static readonly JsonSerializerOptions _serializerOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        };

        public static async Task<HttpResponseData> CreateJsonResponse<T>(HttpRequestData request, HttpStatusCode statusCode, object responseData)
        {
            var response = request.CreateResponse(statusCode);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");

            string jsonString = JsonSerializer.Serialize(responseData, _serializerOptions);
            await response.WriteStringAsync(jsonString);

            return response;
        }

        public static async Task<HttpResponseData> CreateErrorResponse(HttpRequestData request, HttpStatusCode statusCode, string errorMessage)
        {
            return await CreateJsonResponse<object>(request, statusCode, new { error = errorMessage });
        }

    }
}