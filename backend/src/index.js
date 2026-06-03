import express from "express";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import path from "path";
import cors from "cors";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer } from "http";
import cron from "node-cron";

import { initializeSocket } from "./lib/socket.js";

import { connectDB } from "./lib/db.js";
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import authRoutes from "./routes/auth.route.js";
import friendRoutes from "./routes/friend.route.js";
import libraryRoutes from "./routes/library.route.js";
import listeningRoutes from "./routes/listening.route.js";
import playlistRoutes from "./routes/playlist.route.js";
import searchRoutes from "./routes/search.route.js";
import songRoutes from "./routes/song.route.js";
import albumRoutes from "./routes/album.route.js";
import artistRoutes from "./routes/artist.route.js";
import statRoutes from "./routes/stat.route.js";
import subscriptionRoutes from "./routes/subscription.route.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");
const projectRoot = path.resolve(backendRoot, "..");
const app = express();
const PORT = process.env.PORT;
const UPLOAD_MAX_FILE_MB = Number(process.env.UPLOAD_MAX_FILE_MB || 50);

const httpServer = createServer(app);
initializeSocket(httpServer);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json()); // to parse req.body
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(backendRoot, "tmp"),
    createParentPath: true,
    limits: {
      fileSize: UPLOAD_MAX_FILE_MB * 1024 * 1024,
    },
  }),
);

// cron jobs
const tempDir = path.join(backendRoot, "tmp");
cron.schedule("0 * * * *", () => {
  if (fs.existsSync(tempDir)) {
    fs.readdir(tempDir, (err, files) => {
      if (err) {
        console.error("Failed to read temporary upload directory", err);
        return;
      }
      for (const file of files) {
        fs.unlink(path.join(tempDir, file), (unlinkError) => {
          if (unlinkError) {
            console.error("Failed to remove temporary upload file", unlinkError);
          }
        });
      }
    });
  }
});

app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/listening", listeningRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/stats", statRoutes);

if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(projectRoot, "frontend", "dist");
  app.use(express.static(frontendDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  res
    .status(status)
    .json({
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    });
});
httpServer.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
  connectDB();
});
