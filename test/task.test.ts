import supertest from "supertest";
import { TaskTest } from "./test-util";
import { initializeServer, web } from "../src/application/web";
import { logger } from "../src/application/logging";
import { v4 as uuidv4 } from "uuid";
import { connectDB } from "../src/database/connectDB";
import mongoose from "mongoose";

describe("POST /api/tasks", () => {
  beforeAll(async () => {
    await initializeServer();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await TaskTest.deleteAll();
  });

  it("should be able to create task", async () => {
    const response = await supertest(web)
      .post("/api/tasks")
      .send({
        task_id: uuidv4(),
        title: "test", // Ensure this is non-empty
        description: "test",
        dueDate: "2024-10-30",
        priority: "low",
        status: "todo", // Ensure this is a valid enum value
        tags: ["work", "important"],
      });

    logger.debug(response.body);
    expect(response.status).toBe(201);
    expect(response.body.data.task_id).toBeDefined;
    expect(response.body.data.title).toBe("test");
    expect(response.body.data.description).toBe("test");
    expect(response.body.data.dueDate).toBeDefined;
    expect(response.body.data.priority).toBe("low");
    expect(response.body.data.status).toBe("todo");
    expect(response.body.data.tags).toEqual(["work", "important"]);
  });

  it("should not be able to create task because id, title, or status are empty", async () => {
    const response = await supertest(web)
      .post("/api/tasks")
      .send({
        task_id: "",
        title: "",
        description: "test",
        dueDate: "2024-10-30",
        priority: "low",
        status: "",
        tags: ["work", "important"],
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined;
  });
});

describe("GET /api/tasks/:taskId", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  let taskId: string;
  beforeEach(async () => {
    const task = await TaskTest.create();
    taskId = task.task_id;
  });

  afterEach(async () => {
    await TaskTest.deleteAll();
  });

  it("should be able to get task", async () => {
    const task = await TaskTest.get(taskId);
    taskId = task.task_id;
    const response = await supertest(web).get(`/api/tasks/${taskId}`);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.task_id).toBe(taskId);
    expect(response.body.data.title).toBe("test");
    expect(response.body.data.description).toBe("test");
    expect(response.body.data.priority).toBe("low");
    expect(response.body.data.status).toBe("todo");
    expect(response.body.data.tags).toEqual(["work", "important"]);
  });

  it("should not be able to get task if id is invalid", async () => {
    const response = await supertest(web).get(`/api/tasks/asd`);

    logger.debug(response.body);
    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined;
  });
});

describe("PUT /api/tasks/:taskId", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  let taskId: string;
  beforeEach(async () => {
    const task = await TaskTest.create();
    taskId = task.task_id;
  });

  afterEach(async () => {
    await TaskTest.deleteAll();
  });

  it("should be able to update task", async () => {
    const task = await TaskTest.get(taskId);
    taskId = task.task_id;
    const response = await supertest(web)
      .put(`/api/tasks/${taskId}`)
      .send({
        title: "test edited",
        description: "test edited",
        dueDate: "2024-10-20",
        priority: "medium",
        status: "completed",
        tags: ["work", "important", "test"],
      });

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.task_id).toBe(taskId);
    expect(response.body.data.title).toBe("test edited");
    expect(response.body.data.description).toBe("test edited");
    expect(response.body.data.priority).toBe("medium");
    expect(response.body.data.status).toBe("completed");
    expect(response.body.data.tags).toEqual(["work", "important", "test"]);
  });

  it("should not be able to update task if id is invalid", async () => {
    const response = await supertest(web)
      .put(`/api/tasks/wrongId`)
      .send({
        title: "test edited",
        description: "test edited",
        dueDate: "2024-10-20",
        priority: "medium",
        status: "completed",
        tags: ["work", "important", "test"],
      });
    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined;
  });
});

describe("DELETE /api/tasks/:taskId", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  let taskId: string;
  beforeEach(async () => {
    const task = await TaskTest.create();
    taskId = task.task_id;
  });

  afterEach(async () => {
    await TaskTest.deleteAll();
  });

  it("should be able to delete task", async () => {
    const task = await TaskTest.get(taskId);
    taskId = task.task_id;
    const response = await supertest(web).delete(`/api/tasks/${taskId}`);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data).toBe(`Successfully delete task with ID: ${taskId}`);
  });

  it("should not be able to delete task if id is invalid", async () => {
    const task = await TaskTest.get(taskId);
    taskId = task.task_id;
    const response = await supertest(web).delete(`/api/tasks/wrongId`);

    logger.debug(response.body);
    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined();
  });
});

describe("GET /api/tasks", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await TaskTest.create();
  });

  afterEach(async () => {
    await TaskTest.deleteAll();
  });

  it("should be able to search tasks", async () => {
    const response = await supertest(web).get("/api/tasks");

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.paging.current_page).toBe(1);
    expect(response.body.paging.total_page).toBe(1);
    expect(response.body.paging.size).toBe(5);
  });

  it("should be able to search tasks using title", async () => {
    const response = await supertest(web).get("/api/tasks").query({ title: "test" });

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.paging.current_page).toBe(1);
    expect(response.body.paging.total_page).toBe(1);
    expect(response.body.paging.size).toBe(5);
  });

  it("should be able to search tasks using title", async () => {
    const response = await supertest(web).get("/api/tasks").query({ priority: "low" });

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.paging.current_page).toBe(1);
    expect(response.body.paging.total_page).toBe(1);
    expect(response.body.paging.size).toBe(5);
  });

  it("should be able to search tasks using title", async () => {
    const response = await supertest(web).get("/api/tasks").query({ status: "todo" });

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.paging.current_page).toBe(1);
    expect(response.body.paging.total_page).toBe(1);
    expect(response.body.paging.size).toBe(5);
  });

  it("should be able to search tasks with no results", async () => {
    const response = await supertest(web).get("/api/tasks").query({ title: "wrong" });

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(0);
    expect(response.body.paging.current_page).toBe(1);
    expect(response.body.paging.total_page).toBe(0);
    expect(response.body.paging.size).toBe(5);
  });

  it("should be able to search tasks with paging", async () => {
    const response = await supertest(web).get("/api/tasks").query({ page: 2, size: 1 });

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(0);
    expect(response.body.paging.current_page).toBe(2);
    expect(response.body.paging.total_page).toBe(1);
    expect(response.body.paging.size).toBe(1);
  });
});
