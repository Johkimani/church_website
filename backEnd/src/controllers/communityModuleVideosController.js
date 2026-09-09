import { db as pool } from "../Configs/dbConfig.js";
import logger from "../logger/winston.js";
import cloudinary from "../Configs/cloudinaryConfigs.js";
import crypto from "crypto";

const VALID_PLATFORMS = ['tiktok', 'youtube', 'facebook'];
const MAX_VIDEOS_PER_MODULE = 7;
const MAX_UPLOADED_VIDEOS = 7;

/**
 * Manually compute a Cloudinary API signature.
 * Cloudinary's algorithm: sort params alphabetically, join as "k=v&k=v",
 * append the raw API secret, then SHA-1 hash the whole string.
 * Using crypto directly avoids any SDK-version quirks.
 */
function signCloudinaryParams(params, apiSecret) {
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys
    .map((k) => `${k}=${params[k]}`)
    .join('&') + apiSecret;
  return crypto.createHash('sha1').update(stringToSign).digest('hex');
}

export const getUploadSignature = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const currentCount = await getVideoCount(moduleId);
    if (currentCount >= MAX_UPLOADED_VIDEOS) {
      return res.status(400).json({
        success: false,
        error: `Maximum ${MAX_UPLOADED_VIDEOS} uploaded videos allowed. Delete an existing uploaded video first.`,
      });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'community_videos';
    const publicId = `${moduleId}/${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const resourceType = 'video';

    const paramsToSign = {
      folder,
      public_id: publicId,
      resource_type: resourceType,
      timestamp,
    };

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const signature = signCloudinaryParams(paramsToSign, apiSecret);

    res.json({
      success: true,
      signature,
      timestamp,
      folder,
      public_id: publicId,
      resource_type: resourceType,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    logger.error(`[CommunityModuleVideos] Signature error: ${error.message}`);
    res.status(500).json({ success: false, error: `Signature error: ${error.message}` });
  }
};

export const saveUploadedVideo = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, description, video_file_url, cloudinary_public_id } = req.body;

    if (!video_file_url || !cloudinary_public_id) {
      return res.status(400).json({ success: false, error: "video_file_url and cloudinary_public_id are required" });
    }

    const result = await pool.query(
      `INSERT INTO community_module_videos (module_id, platform, video_file_url, video_type, cloudinary_public_id, title, description, posted_by)
       VALUES ($1, 'upload', $2, 'upload', $3, $4, $5, $6)
       RETURNING *`,
      [moduleId, video_file_url, cloudinary_public_id, title || '', description || '', req.user?.name || req.user?.email || 'Admin']
    );

    res.json({ success: true, video: result.rows[0] });
  } catch (error) {
    logger.error(`[CommunityModuleVideos] Save upload error: ${error.message}`);
    res.status(500).json({ success: false, error: `Save error: ${error.message}` });
  }
};

function normalizePlatform(p) {
  const normalized = p.toLowerCase().trim();
  if (normalized.includes('tiktok') || normalized.includes('tik tok')) return 'tiktok';
  if (normalized.includes('youtube') || normalized.includes('yt')) return 'youtube';
  if (normalized.includes('facebook') || normalized.includes('fb')) return 'facebook';
  return normalized;
}

function normalizeVideoUrl(platform, rawUrl) {
  if (!rawUrl) return '';
  const url = String(rawUrl).trim();
  const p = (platform || '').toLowerCase();

  let cleaned = url.replace(/^https?:\/\//i, '').replace(/^\/\//, '').trim();

  if (p.includes('tiktok')) {
    if (cleaned.toLowerCase().includes('tiktok.com')) {
      cleaned = cleaned.replace(/^www\./i, '');
      return `https://www.${cleaned}`;
    }
    return `https://www.tiktok.com/@user/video/${cleaned}`;
  }

  if (p.includes('youtube') || p.includes('youtu.be')) {
    if (cleaned.toLowerCase().includes('youtu.be')) {
      return `https://${cleaned}`;
    }
    if (cleaned.toLowerCase().includes('youtube.com')) {
      cleaned = cleaned.replace(/^www\./i, '');
      return `https://www.${cleaned}`;
    }
    if (cleaned.startsWith('UC') && cleaned.length >= 20) {
      return `https://www.youtube.com/channel/${cleaned}`;
    }
    const handle = cleaned.startsWith('@') ? cleaned : `@${cleaned}`;
    return `https://www.youtube.com/${handle}`;
  }

  if (p.includes('facebook')) {
    if (cleaned.toLowerCase().includes('facebook.com') || cleaned.toLowerCase().includes('fb.com')) {
      cleaned = cleaned.replace(/^www\./i, '');
      return `https://www.${cleaned}`;
    }
    return `https://www.facebook.com/${cleaned}`;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

function extractVideoId(platform, url) {
  const p = (platform || '').toLowerCase();
  const u = (url || '').toLowerCase();

  if (p.includes('youtube') || p.includes('youtu.be')) {
    const match = u.match(/[?&]v=([^&]+)/) || u.match(/youtu\.be\/([^?]+)/) || u.match(/youtube\.com\/embed\/([^?]+)/);
    return match ? match[1] : null;
  }

  if (p.includes('tiktok')) {
    const match = u.match(/\/video\/(\d+)/);
    return match ? match[1] : null;
  }

  return null;
}

function getThumbnailUrl(platform, url) {
  const p = (platform || '').toLowerCase();

  if (p.includes('youtube')) {
    const videoId = extractVideoId('youtube', url);
    if (videoId) return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }

  return null;
}

async function getVideoCount(moduleId) {
  const result = await pool.query(
    `SELECT COUNT(*)::int as count FROM community_module_videos WHERE module_id = $1 AND video_type = 'upload'`,
    [moduleId]
  );
  return result.rows[0].count;
}

export const getCommunityModuleVideos = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const result = await pool.query(
      `SELECT * FROM community_module_videos WHERE module_id = $1 ORDER BY created_at DESC`,
      [moduleId]
    );

    const videos = result.rows.map(v => ({
      ...v,
      thumbnail_url: v.thumbnail_url || getThumbnailUrl(v.platform, v.video_url),
    }));

    res.json({ success: true, videos, maxVideos: MAX_VIDEOS_PER_MODULE });
  } catch (error) {
    logger.error(`[CommunityModuleVideos] Get error: ${error.message}`);
    res.status(500).json({ success: false, error: "Failed to fetch videos" });
  }
};

export const addCommunityModuleVideo = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { platform, video_url, title, description } = req.body;

    if (!platform || !video_url) {
      return res.status(400).json({ success: false, error: "platform and video_url are required" });
    }

    const normalizedPlatform = normalizePlatform(platform);
    if (!VALID_PLATFORMS.includes(normalizedPlatform)) {
      return res.status(400).json({ success: false, error: "Invalid platform. Allowed: tiktok, youtube, facebook" });
    }

    const normalizedUrl = normalizeVideoUrl(normalizedPlatform, video_url);

    const result = await pool.query(
      `INSERT INTO community_module_videos (module_id, platform, video_url, title, description, thumbnail_url, posted_by, video_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'link')
       ON CONFLICT (module_id, video_url) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         thumbnail_url = EXCLUDED.thumbnail_url
       RETURNING *`,
      [moduleId, normalizedPlatform, normalizedUrl, title || '', description || '', getThumbnailUrl(normalizedPlatform, normalizedUrl), req.user?.name || req.user?.email || 'Admin']
    );

    res.json({ success: true, video: result.rows[0] });
  } catch (error) {
    logger.error(`[CommunityModuleVideos] Add error: ${error.message}`);
    res.status(500).json({ success: false, error: "Failed to add video" });
  }
};

export const uploadCommunityModuleVideo = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, description } = req.body;

    // Enforce max 7 videos per module
    const currentCount = await getVideoCount(moduleId);
    if (currentCount >= MAX_VIDEOS_PER_MODULE) {
      // Clean up uploaded file since we're rejecting
      if (req.file?.filename) {
        cloudinary.uploader.destroy(req.file.filename, { resource_type: "video" });
      }
      return res.status(400).json({
        success: false,
        error: `Maximum ${MAX_VIDEOS_PER_MODULE} videos allowed. Delete an existing video first.`,
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: "No video file uploaded" });
    }

    const videoUrl = req.file.path;
    const cloudinaryPublicId = req.file.filename;

    const result = await pool.query(
      `INSERT INTO community_module_videos (module_id, platform, video_file_url, video_type, cloudinary_public_id, title, description, posted_by)
       VALUES ($1, 'upload', $2, 'upload', $3, $4, $5, $6)
       RETURNING *`,
      [moduleId, videoUrl, cloudinaryPublicId, title || req.file.originalname || '', description || '', req.user?.name || req.user?.email || 'Admin']
    );

    res.json({ success: true, video: result.rows[0] });
  } catch (error) {
    logger.error(`[CommunityModuleVideos] Upload error: ${error.message}`);
    res.status(500).json({ success: false, error: "Failed to upload video" });
  }
};

export const deleteCommunityModuleVideo = async (req, res) => {
  try {
    const { moduleId, videoId } = req.params;

    // Get video info first to clean up Cloudinary file
    const videoResult = await pool.query(
      `SELECT * FROM community_module_videos WHERE id = $1 AND module_id = $2`,
      [videoId, moduleId]
    );

    if (videoResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Video not found" });
    }

    const video = videoResult.rows[0];

    // Delete from Cloudinary if it's an uploaded video
    if (video.video_type === 'upload' && video.cloudinary_public_id) {
      cloudinary.uploader.destroy(video.cloudinary_public_id, { resource_type: "video" }, (err) => {
        if (err) logger.warn(`Failed to delete video from Cloudinary: ${err.message}`);
      });
    }

    // Delete from database
    await pool.query(
      `DELETE FROM community_module_videos WHERE id = $1 AND module_id = $2`,
      [videoId, moduleId]
    );

    res.json({ success: true, deleted: video });
  } catch (error) {
    logger.error(`[CommunityModuleVideos] Delete error: ${error.message}`);
    res.status(500).json({ success: false, error: "Failed to delete video" });
  }
};

export const updateCommunityModuleVideo = async (req, res) => {
  try {
    const { moduleId, videoId } = req.params;
    const { title, description, thumbnail_url } = req.body;

    const result = await pool.query(
      `UPDATE community_module_videos
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           thumbnail_url = COALESCE($3, thumbnail_url)
       WHERE id = $4 AND module_id = $5
       RETURNING *`,
      [title, description, thumbnail_url, videoId, moduleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Video not found" });
    }

    res.json({ success: true, video: result.rows[0] });
  } catch (error) {
    logger.error(`[CommunityModuleVideos] Update error: ${error.message}`);
    res.status(500).json({ success: false, error: "Failed to update video" });
  }
};
