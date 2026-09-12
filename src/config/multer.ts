import type { Request } from 'express';
import multer from "multer";
import { type FileFilterCallback } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from './index';

const uploadDir = path.join(process.cwd(), 'uploads');

/**
 * Disk storage engine — saves files with unique names preserving the extension.
 */
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

/**
 * Image-only file filter for avatars and image attachments.
 */
const imageFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (config.upload.allowedImageTypes.includes(file.mimetype as any)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF, and WebP are allowed.`));
  }
};

/**
 * General file filter — allows common document, media, and archive types.
 */
const generalFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = [
    ...config.upload.allowedImageTypes,
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'audio/mpeg',
    'audio/wav',
    'video/mp4',
    'video/webm',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`));
  }
};

/** Multer instance for avatar uploads (single image, 2MB max) */
export const avatarUpload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

/** Multer instance for attachment uploads (multiple files, configurable max) */
export const attachmentUpload = multer({
  storage,
  fileFilter: generalFilter,
  limits: { fileSize: config.upload.maxFileSize },
});

