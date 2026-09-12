import { Schema, model } from 'mongoose';
import type { IConversation } from '../types';
import { CONVERSATION_TYPES, ROLES } from '../utils/constants';

// ──────────────────────────────────────────────
// Sub-schema: Participant
// ──────────────────────────────────────────────

const participantSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.MEMBER,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// ──────────────────────────────────────────────
// Schema
// ──────────────────────────────────────────────

const conversationSchema = new Schema<IConversation>(
  {
    type: {
      type: String,
      enum: Object.values(CONVERSATION_TYPES),
      required: [true, 'Conversation type is required'],
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Group name cannot exceed 100 characters'],
      // Required only for group conversations (validated in service layer)
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    participants: {
      type: [participantSchema],
      validate: {
        validator: function (v: unknown[]) {
          return v.length >= 2;
        },
        message: 'A conversation must have at least 2 participants',
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    metadata: {
      totalMessages: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ──────────────────────────────────────────────
// Indexes
// ──────────────────────────────────────────────

// Find all conversations for a user, sorted by most recent activity
conversationSchema.index({ 'participants.user': 1, updatedAt: -1 });

// Filter by type
conversationSchema.index({ type: 1 });

// Populate last message efficiently
conversationSchema.index({ lastMessage: 1 });

// ──────────────────────────────────────────────
// JSON transform
// ──────────────────────────────────────────────

conversationSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete (ret as any).__v;
    return ret;
  },
});

// ──────────────────────────────────────────────
// Model
// ──────────────────────────────────────────────

export const Conversation = model<IConversation>('Conversation', conversationSchema);

