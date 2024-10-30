import express from "express";
import "../database/connectDB"; // connect to DB

export const web = express();
web.use(express.json());
