
import upload, { uploadTshirt } from "../Configs/multerStorageConfig.js"
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

    // Populate req.file for single-file handlers
    if (req.files.length > 0) {
      req.file = req.files[0];
    }

    next();
  });
}

// T-shirt product image upload — single `tshirt_image` field, Cloudinary "community_tshirts"
export function uploadTshirtMiddleware(req, res, next) {
  uploadTshirt.single("tshirt_image")(req, res, (err) => {
    if (err) {
      logger.error("Unexpected tshirt upload error", err);
      return next(new ApiError(500, "Internal upload error"));
    }
    next();
  });
}

// Jumuiya t-shirt sample image upload — single `tshirt_image` field, Cloudinary "jumuiya_tshirts"
export function uploadJumuiyaTshirtMiddleware(req, res, next) {
  uploadJumuiyaTshirt.single("tshirt_image")(req, res, (err) => {
    if (err) {
      logger.error("Unexpected jumuiya tshirt upload error", err);
      return next(new ApiError(500, "Internal upload error"));
    }
    next();
  });
}
