// Initialize OpenTelemetry tracing FIRST
import "./tracing";

import dotenv from "dotenv";
import app from "./app";
import { Server } from "http";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Weather Map Backend API is running" });
});

let server: Server | null = null;

// Start server only if this file is run directly
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export app for testing and server for graceful shutdown
export default app;
export { server };
