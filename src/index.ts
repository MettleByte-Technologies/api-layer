import app from "./app";
import { testDBConnection } from "./utils/db-test";
import { env } from "./config/env";
import { logger } from "./utils/logger";

const PORT = Number(env.PORT || 5000);

const startServer = async (): Promise<void> => {
  try {
    await testDBConnection();

    app.listen(PORT, () => {
      logger.info("Server started", { port: PORT });
    });
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
};

startServer();
