// @ts-nocheck
import bcrypt from 'bcryptjs';
import { Schema, model, type Model } from 'mongoose';
import type { IUser, IUserDocument, IUserMethods } from '../types';

// ──────────────────────────────────────────────
// Schema
// ──────────────────────────────────────────────

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<any, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    bio: {
      type: String,
      default: '',
      maxlength: [200, 'Bio cannot exceed 200 characters'],
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    notificationPreferences: {
      messages: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true },
      groupUpdates: { type: Boolean, default: true },
    },
    refreshToken: {
      type: String,
      select: false, // Don't include in queries by default
    },
  },
  {
    timestamps: true,
  }
);

// ──────────────────────────────────────────────
// Indexes
// ──────────────────────────────────────────────

// Text index for user search (name + email)
userSchema.index({ name: 'text', email: 'text' });

// ──────────────────────────────────────────────
// Pre-save Hooks
// ──────────────────────────────────────────────

userSchema.pre('save', async function (this: any, next) {
  // Only hash password if it was modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// ──────────────────────────────────────────────
// Instance Methods
// ──────────────────────────────────────────────

userSchema.methods.isPasswordCorrect = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicProfile = function (this: any) {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    isOnline: this.isOnline,
    lastSeen: this.lastSeen,
    blockedUsers: this.blockedUsers,
    notificationPreferences: this.notificationPreferences,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// ──────────────────────────────────────────────
// Ensure virtuals are included in JSON
// ──────────────────────────────────────────────

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete (ret as any).password;
    delete (ret as any).refreshToken;
    delete (ret as any).__v;
    return ret;
  },
});

// ──────────────────────────────────────────────
// Model
// ──────────────────────────────────────────────

export const User = model<IUser, UserModel>('User', userSchema);

