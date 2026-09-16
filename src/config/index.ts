import dotenv from "dotenv";

dotenv.config();
export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),

  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp",
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "access-secret-dev-only",
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret-dev-only",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10), // 5MB default
    allowedImageTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  },

  log: {
    level: process.env.LOG_LEVEL || "info",
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
    authMax: 20, // stricter limit for auth routes
  },

  cookie: {
    httpOnly: true,
    secure: (process.env.NODE_ENV || "development") === "production",
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/api/v1/auth",
  },
} as const;
