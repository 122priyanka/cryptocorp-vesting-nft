const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const vestingRoutes = require("./routes/vesting.routes");
const analyticsRoutes = require("./routes/analytics.routes");

const app = express();

// Middlewares – allow frontend origin for local dev
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api", vestingRoutes);
app.use("/api", analyticsRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("CryptoCorp Backend Running");
});

// Global error handler – never expose internal errors to client
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Server error. Please try again." });
});

module.exports = app;
