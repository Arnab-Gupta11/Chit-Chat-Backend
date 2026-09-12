import { Schema, model } from 'mongoose';
import type { INotification } from '../types';
import { NOTIFICATION_TYPES } from '../utils/constants';

// ──────────────────────────────────────────────
// Schema
// ──────────────────────────────────────────────

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
      trim: true,
    },
    data: {
      conversation: { type: Schema.Types.ObjectId, ref: 'Conversation' },
      message: { type: Schema.Types.ObjectId, ref: 'Message' },
      sender: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Notifications are immutable once created
  }
);

// ──────────────────────────────────────────────
// Indexes
// ──────────────────────────────────────────────

// Primary: list notifications for a user, newest first
notificationSchema.index({ recipient: 1, createdAt: -1 });

// Unread count query
notificationSchema.index({ recipient: 1, isRead: 1 });

// Combined: unread notifications for a user, newest first
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// ──────────────────────────────────────────────
// JSON transform
// ──────────────────────────────────────────────

notificationSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete (ret as any).__v;
    return ret;
  },
});

// ──────────────────────────────────────────────
// Model
// ──────────────────────────────────────────────

export const Notification = model<INotification>('Notification', notificationSchema);

