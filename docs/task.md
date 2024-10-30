# Task API Spec

## Create Task

Endpoint : POST /api/tasks

Request Body :

```json
{
  "title": "API Test",
  "description": "Do technical test",
  "dueDate": "2024-10-30",
  "priority": "low", // allowed: ["low", "medium", "high"]
  "status": "todo", // allowed: ["todo", "in-progress", "completed"]
  "tags": ["urgent", "work", "important"]
}
```

Response Body (Success):

```json
{
  "data": {
    "task_id": "<generated_uuid>",
    "title": "API Test",
    "description": "Do technical test",
    "dueDate": "2024-10-30",
    "priority": "low", // allowed: ["low", "medium", "high"]
    "status": "todo", // allowed: ["todo", "in-progress", "completed"]
    "tags": ["urgent", "work", "important"]
  }
}
```

Response Body (Failed):

```json
{
  "errors": "Title can't be empty, ..."
}
```

## Get Task by ID

Endpoint : GET /api/tasks/{taskId}

Response Body (Success):

```json
{
  "data": {
    "task_id": "<task_uuid>",
    "title": "API Test",
    "description": "Do technical test",
    "dueDate": "2024-10-30",
    "priority": "low", // allowed: ["low", "medium", "high"]
    "status": "todo", // allowed: ["todo", "in-progress", "completed"]
    "tags": ["urgent", "work", "important"]
  }
}
```

Response Body (Failed):

```json
{
  "errors": "Task not found!"
}
```

## Update Task

Endpoint : PUT /api/tasks/{taskId}

Request Body :

```json
{
  "title": "API Test edited",
  "description": "Do technical test edited",
  "dueDate": "2024-10-20",
  "priority": "medium", // allowed: ["low", "medium", "high"]
  "status": "completed", // allowed: ["todo", "in-progress", "completed"]
  "tags": ["urgent", "work", "important", "test"]
}
```

Response Body (Success):

```json
{
  "data": {
    "task_id": "<task_uuid>",
    "title": "API Test edited",
    "description": "Do technical test edited",
    "dueDate": "2024-10-20",
    "priority": "medium",
    "status": "completed",
    "tags": ["urgent", "work", "important", "test"]
  }
}
```

Response Body (Failed):

```json
{
  "errors": "Task not found!"
}
```

## Search Task

Endpoint : GET /api/tasks

Query Parameters:

- title (optional) : string
- priority (optional) : "low" | "medium" | "high"
- status (optional) : "todo" | "in-progress" | "completed"
- page (optional, default: 1) : number
- size (optional, default: 5) : number

Response Body (Success):

```json
{
  "data": [
    {
      "task_id": "<task_uuid>",
      "title": "API Test",
      "description": "Do technical test",
      "dueDate": "2024-10-30",
      "priority": "low",
      "status": "todo",
      "tags": ["urgent", "work", "important"]
    }
  ],
  "paging": {
    "current_page": 1,
    "total_page": 1,
    "size": 5
  }
}
```

Response Body (No Results):

```json
{
  "data": [],
  "paging": {
    "current_page": 1,
    "total_page": 0,
    "size": 5
  }
}
```

## Delete Task

Endpoint : DELETE /api/tasks/{taskId}

Response Body (Success):

```json
{
  "data": "Successfully delete task with ID: <task_uuid>"
}
```

Response Body (Failed):

```json
{
  "errors": "Task not found!"
}
```
