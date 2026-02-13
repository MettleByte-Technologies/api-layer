import { db } from "../config/database";
import { logger } from "./logger";

export const testDBConnection = async () => {
  try {
    const connection = await db.getConnection();
    logger.info("Database connected successfully");
    connection.release();
  } catch (error) {
    logger.error("Database connection failed", { error });
    process.exit(1);
  }
};