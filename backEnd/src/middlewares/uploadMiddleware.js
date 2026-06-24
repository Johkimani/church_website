
import upload from "../Configs/multerStorageConfig.js"
import logger from "../logger/winston.js";
import { ApiError } from "../utils/ApiError.js";


export function uploadMiddleware(req, res, next) {
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "files", maxCount: 10 },
    { name: "photo", maxCount: 1 }
  ])(req, res, (err) => {
 
    if (err) {
      logger.error("Unexpected upload error", err);
      return next(new ApiError(500, "Internal upload error"));
    }

    // Normalize: merge all into req.files array
    req.files = [
      ...(req.files?.file || []),
      ...(req.files?.files || []),
      ...(req.files?.photo || [])
    ];

    console.log("uploadMiddleware req.files object:", req.files);
    console.log("uploadMiddleware merged req.files length:", req.files.length);

    // Populate req.file for single-file handlers
    if (req.files.length > 0) {
      req.file = req.files[0];
    }

    next();
  });
}