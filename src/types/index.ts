import type { Document, Types } from 'mongoose';
import type {
    AttachmentType,
    ConversationType,
    MessageType,
    NotificationType,
    ReactionEmoji,
    Role,
} from '../utils/constants';

// ══════════════════════════════════════════════
//  Express Augmentation
// ══════════════════════════════════════════════

declare global {
  namespace Express {
    interface Request {
      /** Authenticated user document attached by auth middleware */
      user?: IUserDocument;
    }
  }
}

// ══════════════════════════════════════════════
//  Shared / Embedded Sub-Document Interfaces
// ══════════════════════════════════════════════

export interface IAvatar {
  url: string;
  publicId: string;
}

export interface IParticipant {
  user: Types.ObjectId;
  role: Role;
  joinedAt: Date;
  lastReadAt: Date;
}

export interface IAttachment {
  type: AttachmentType;
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface IReaction {
  user: Types.ObjectId;
  emoji: ReactionEmoji;
  createdAt: Date;
}

export interface IReadReceipt {
  user: Types.ObjectId;
  readAt: Date;
}

export interface IDeliveryReceipt {
  user: Types.ObjectId;
  deliveredAt: Date;
}

export interface IForwardedFrom {
  message: Types.ObjectId;
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
}

export interface INotificationData {
  conversation?: Types.ObjectId;
  message?: Types.ObjectId;
  sender?: Types.ObjectId;
}

export interface INotificationPreferences {
  messages: boolean;
  mentions: boolean;
  groupUpdates: boolean;
}

// ══════════════════════════════════════════════
//  User
// ══════════════════════════════════════════════

export interface IUser {
  name: string;
  email: string;
  password: string;
  avatar: IAvatar;
  bio: string;
  isOnline: boolean;
  lastSeen: Date;
  blockedUsers: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserMethods {
  /** Compare a candidate password against the stored hash */
  isPasswordCorrect(candidatePassword: string): Promise<boolean>;
  /** Return a sanitized user object (no password, no refreshToken) */
  toPublicProfile(): Omit<IUser, 'password' | 'refreshToken'> & { _id: Types.ObjectId };
}

export interface IUserDocument extends IUser, Document, IUserMethods {
  _id: Types.ObjectId;
}

// ══════════════════════════════════════════════
//  Conversation
// ══════════════════════════════════════════════

export interface IConversation {
  type: ConversationType;
  name?: string;
  avatar: IAvatar;
  participants: IParticipant[];
  createdBy: Types.ObjectId;
  lastMessage?: Types.ObjectId;
  metadata: {
    totalMessages: number;
  };
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IConversationDocument extends IConversation, Document {
  _id: Types.ObjectId;
}

// ══════════════════════════════════════════════
//  Message
// ══════════════════════════════════════════════

export interface IMessage {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  type: MessageType;
  replyTo?: Types.ObjectId;
  forwardedFrom?: IForwardedFrom;
  attachments: IAttachment[];
  reactions: IReaction[];
  readBy: IReadReceipt[];
  deliveredTo: IDeliveryReceipt[];
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessageDocument extends IMessage, Document {
  _id: Types.ObjectId;
}

// ══════════════════════════════════════════════
//  Notification
// ══════════════════════════════════════════════

export interface INotification {
  recipient: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  data: INotificationData;
  isRead: boolean;
  readAt?: Date;
  createdAt?: Date;
}

export interface INotificationDocument extends INotification, Document {
  _id: Types.ObjectId;
}

