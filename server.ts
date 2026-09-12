import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { apiRouter } from "./server/apiRouter.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// API routes
app.use("/api", apiRouter);

// Serve static frontend in production
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
