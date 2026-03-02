require("dotenv").config({ path: "../.env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 6997;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow cross-origin images
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

// Database Connection
if (!process.env.MONGODB_URI) {
  console.error("FATAL ERROR: MONGODB_URI is not defined.");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    require("./services/BackupService").init();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.get("/", (req, res) => {
  res.send("OT-Dashboard API is running");
});

const projectsRouter = require("./routes/projects");
const configsRouter = require("./routes/configs");
const accessRouter = require("./routes/access");
const clientRouter = require("./routes/client");
const instancesRouter = require("./routes/instances");
const authRouter = require("./routes/auth");
const analyticsRouter = require("./routes/analytics");
const teamRouter = require("./routes/team");
const settingsRouter = require("./routes/settings");
const licensesRouter = require("./routes/licenses");
const auditRouter = require("./routes/audit");
const notificationsRouter = require("./routes/notifications");

app.use("/api/projects", projectsRouter); // TODO: Protect this
app.use("/api/audit", auditRouter); // TODO: Protect this
app.use("/api/configs", configsRouter); // TODO: Protect this
app.use("/api/access", accessRouter); // TODO: Protect this
app.use("/api/instances", instancesRouter); // TODO: Protect this
app.use("/api/auth", authRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/team", teamRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/licenses", licensesRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/v1", clientRouter); // Public

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
