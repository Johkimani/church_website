import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cors from "cors";
import multer from 'multer';

import apiRoutes from "./routers/index.js";
import { api } from "./routers/api.js";
import { hubRouter } from "./routers/hubRouter.js";
import officialsRouter from "./routers/officialsRouter.js";
import jumuiyaOfficialsRouter from "./routers/jumuiyaOfficialsRouter.js";
import jumuiyaMembersRouter from "./routers/jumuiyaMembersRouter.js";
import jumuiyaDataRouter from "./routers/jumuiyaDataRouter.js";
import { BackendDataService } from "./services/backend-data.js";
import morganMiddleware from "./logger/morgan.js";
import { rateLimit } from "express-rate-limit";
import requestIp from "request-ip";
import corsOptions from "./Configs/corsConfigs.js";
import upload from "./Configs/multerStorageConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(requestIp.mw());
app.use(morganMiddleware);

// 1. Hub Router (High priority for dynamic routes)
app.use("/hub-view", hubRouter);

// 2. Static Files (Cleanup for files that router didn't catch)
app.use('/hub-view', express.static(path.join(__dirname, "../../frontEnd/src/pages/sacramental")));
app.use(express.static(path.join(__dirname, "../../frontEnd/src/pages/sacramental")));

app.use("/community-assets", express.static(path.join(__dirname, "../../frontEnd/src/pages/sacramental")),);

app.use("/localFileUploads", express.static(path.join(process.cwd(), "localFileUploads")));
app.use("/uploads", express.static(path.join(process.cwd(), "localFileUploads")));

// Routes
app.get('/', (_req, res) => res.redirect('/hub-view'));

app.use("/authentication", apiRoutes);
app.use("/api/officials", officialsRouter);
app.use("/api/jumuiya-officials", jumuiyaOfficialsRouter);
app.use("/api/jumuiya-members", jumuiyaMembersRouter);
app.use("/api/jumuiya-data", jumuiyaDataRouter);
app.use("/api", api);

app.use("/questions", apiRoutes);
app.use("/files" , apiRoutes)

// Gallery APIs
app.get("/api/choir/gallery", (_req, res) => {
  const gallery = BackendDataService.load("choir_gallery.json", []);
  res.json(gallery);
});

app.post("/api/choir/gallery", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const gallery = BackendDataService.load("choir_gallery.json", []);
  const newPhoto = {
    id: Date.now().toString(),
    filename: req.file.filename,
    eventName: req.body.eventName || "Untitled Event",
    description: req.body.description || "",
    uploadDate: new Date().toISOString(),
    imageUrl: `/images/gallery/${req.file.filename}`,
  };
  gallery.push(newPhoto);
  BackendDataService.save("choir_gallery.json", gallery);
  res.status(201).json(newPhoto);
});

// Error Handler
app.use((err, req, res, next) => {
  if (err.stack) console.error(err.stack);
  
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

export { app };
