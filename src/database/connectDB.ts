import mongoose from "mongoose";
import config from "../config/enviroment";
import { logger } from "../application/logging";
import { error } from "winston";

mongoose
  .connect(`${config.db}`)
  .then(() => {
    logger.info("Connected to MongoDB");
  })
  .catch((error) => {
    logger.info("Could not connect to MongoDB");
    logger.error(error);
    process.exit(1);
  });
