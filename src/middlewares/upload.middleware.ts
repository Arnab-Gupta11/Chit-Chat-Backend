import { attachmentUpload, avatarUpload } from '../config/multer';

/**
 * Middleware for single avatar upload.
 * Field name: "avatar"
 *
 * After this middleware, `req.file` contains the uploaded file info.
 */
export const uploadAvatar = avatarUpload.single('avatar');

/**
 * Middleware for multiple attachment uploads (max 5 files).
 * Field name: "attachments"
 *
 * After this middleware, `req.files` contains an array of uploaded files.
 */
export const uploadAttachments = attachmentUpload.array('attachments', 5);

