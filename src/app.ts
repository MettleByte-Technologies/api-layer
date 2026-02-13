import express from "express";
import routes from "./routes";
import { requestLogger } from "./middlewares/request-logger";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

const app = express();

app.use(express.json());
app.use(requestLogger);

app.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

// Swagger UI at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1", routes);

export default app;
