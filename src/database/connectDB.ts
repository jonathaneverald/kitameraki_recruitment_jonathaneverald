import mongoose from "mongoose";
import config from "../config/enviroment";
import { logger } from "../application/logging";

export const connectDB = async () => {
  try {
    await mongoose.connect(`${config.db}`);
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error("Could not connect to MongoDB", error);
    process.exit(1);
  }
};
