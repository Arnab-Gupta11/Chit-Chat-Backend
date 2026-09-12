// ──────────────────────────────────────────────
// Conversation Types
// ──────────────────────────────────────────────
export const CONVERSATION_TYPES = {
  DIRECT: 'direct',
  GROUP: 'group',
} as const;

export type ConversationType = (typeof CONVERSATION_TYPES)[keyof typeof CONVERSATION_TYPES];

// ──────────────────────────────────────────────
// Participant Roles
// ──────────────────────────────────────────────
export const ROLES = {
  MEMBER: 'member',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ──────────────────────────────────────────────
// Message Types
// ──────────────────────────────────────────────
export const MESSAGE_TYPES = {
  TEXT: 'text',
  SYSTEM: 'system',
  ATTACHMENT: 'attachment',
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

// ──────────────────────────────────────────────
// Attachment Types
// ──────────────────────────────────────────────
export const ATTACHMENT_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  OTHER: 'other',
} as const;

export type AttachmentType = (typeof ATTACHMENT_TYPES)[keyof typeof ATTACHMENT_TYPES];

// ──────────────────────────────────────────────
// Notification Types
// ──────────────────────────────────────────────
export const NOTIFICATION_TYPES = {
  NEW_MESSAGE: 'new_message',
  MENTION: 'mention',
  GROUP_INVITE: 'group_invite',
  GROUP_UPDATE: 'group_update',
  REACTION: 'reaction',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

// ──────────────────────────────────────────────
// Allowed Reaction Emojis
// ──────────────────────────────────────────────
export const REACTION_EMOJIS = [
  '👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '👏', '🤔',
] as const;

export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

// ──────────────────────────────────────────────
// Pagination Defaults
// ──────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1,
} as const;

// ──────────────────────────────────────────────
// Group Limits
// ──────────────────────────────────────────────
export const GROUP_LIMITS = {
  MAX_MEMBERS: 256,
  MIN_MEMBERS: 2,
  MAX_NAME_LENGTH: 100,
} as const;

// ──────────────────────────────────────────────
// Validation Limits
// ──────────────────────────────────────────────
export const VALIDATION = {
  NAME_MIN: 2,
  NAME_MAX: 50,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  BIO_MAX: 200,
  MESSAGE_MAX: 5000,
  SEARCH_MIN: 1,
  SEARCH_MAX: 100,
} as const;

// ──────────────────────────────────────────────
// Socket Events (reserved names for future use)
// ──────────────────────────────────────────────
export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  // Client → Server
  JOIN_CONVERSATION: 'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  MESSAGE_DELIVERED: 'message_delivered',
  MESSAGE_READ: 'message_read',

  // Server → Client
  NEW_MESSAGE: 'new_message',
  MESSAGE_EDITED: 'message_edited',
  MESSAGE_DELETED: 'message_deleted',
  REACTION_UPDATED: 'reaction_updated',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  TYPING: 'typing',
  CONVERSATION_UPDATED: 'conversation_updated',
  MEMBER_ADDED: 'member_added',
  MEMBER_REMOVED: 'member_removed',
  NOTIFICATION: 'notification',
} as const;

