import { Schema, model } from 'mongoose';
import type { IMessage } from '../types';
import { ATTACHMENT_TYPES, MESSAGE_TYPES, REACTION_EMOJIS } from '../utils/constants';

// ──────────────────────────────────────────────
// Sub-schemas
// ──────────────────────────────────────────────

const attachmentSchema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(ATTACHMENT_TYPES),
      required: true,
    },
    url: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
  },
  { _id: false }
);

const reactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    emoji: {
      type: String,
      enum: REACTION_EMOJIS,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const readReceiptSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const deliveryReceiptSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deliveredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const forwardedFromSchema = new Schema(
  {
    message: { type: Schema.Types.ObjectId, ref: 'Message', required: true },
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { _id: false }
);

// ──────────────────────────────────────────────
// Schema
// ──────────────────────────────────────────────

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation is required'],
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    content: {
      type: String,
      default: '',
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    type: {
      type: String,
      enum: Object.values(MESSAGE_TYPES),
      default: MESSAGE_TYPES.TEXT,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    forwardedFrom: {
      type: forwardedFromSchema,
      default: null,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    reactions: {
      type: [reactionSchema],
      default: [],
    },
    readBy: {
      type: [readReceiptSchema],
      default: [],
    },
    deliveredTo: {
      type: [deliveryReceiptSchema],
      default: [],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ──────────────────────────────────────────────
// Indexes
// ──────────────────────────────────────────────

// Primary query: message history with cursor-based pagination
messageSchema.index({ conversation: 1, createdAt: -1 });

// For looking up messages by sender
messageSchema.index({ sender: 1 });

// Text search within a conversation
messageSchema.index({ conversation: 1, content: 'text' });

// Reaction and read receipt lookups
messageSchema.index({ 'reactions.user': 1 });
messageSchema.index({ 'readBy.user': 1 });

// ──────────────────────────────────────────────
// JSON transform
// ──────────────────────────────────────────────

messageSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete (ret as any).__v;
    return ret;
  },
});

// ──────────────────────────────────────────────
// Model
// ──────────────────────────────────────────────

export const Message = model<IMessage>('Message', messageSchema);

