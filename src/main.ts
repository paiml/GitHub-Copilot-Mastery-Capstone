import { startServer } from "./server.ts";
import { config } from "./shared/utils/config.ts";
import { logger } from "./shared/utils/logger.ts";

if (import.meta.main) {
  try {
    const server = startServer(config.port);
    logger.info("Server started successfully", {
      port: config.port,
      environment: config.environment,
    });

    const shutdownHandler = () => {
      logger.info("Shutting down server");
      server.shutdown();
      Deno.exit(0);
    };

    Deno.addSignalListener("SIGINT", shutdownHandler);
    Deno.addSignalListener("SIGTERM", shutdownHandler);
  } catch (error) {
    logger.error("Failed to start server", error as Error);
    Deno.exit(1);
  }
}
