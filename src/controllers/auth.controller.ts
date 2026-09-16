import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { apiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import * as authService from "../services/auth.service";
import { config } from "../config";

const refreshTokenOptions = {
  httpOnly: true,
  secure: config.env === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/api/v1/auth",
};

const accessTokenOptions = {
  httpOnly: true,
  secure: config.env === "production",
  sameSite: "strict" as const,
  maxAge: 15 * 60 * 1000, // 15 min
  path: "/",
};

/**
 * Register a new user
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const result = await authService.register(name, email, password);

  res.cookie("refreshToken", result.refreshToken, refreshTokenOptions);
  res.cookie("accessToken", result.accessToken, accessTokenOptions);

  return apiResponse(res, 201, "User registered successfully", {
    user: result.user,
  });
});

/**
 * Login a user
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  res.cookie("refreshToken", result.refreshToken, refreshTokenOptions);
  res.cookie("accessToken", result.accessToken, accessTokenOptions);

  return apiResponse(res, 201, "User logged in successfully", {
    user: result.user,
  });
});

/**
 * Refresh access token
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;
    if (!token) {
      throw new ApiError(401, "Refresh token not found");
    }

    const result = await authService.refreshAccessToken(token);

    res.cookie("refreshToken", result.refreshToken, refreshTokenOptions);
    res.cookie("accessToken", result.accessToken, accessTokenOptions);

    return apiResponse(res, 200, "Token refreshed successfully");
  },
);

/**
 * Logout a user
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  await authService.logout(userId.toString());

  res.clearCookie("refreshToken", { ...refreshTokenOptions, maxAge: 0 });
  res.clearCookie("accessToken", { ...accessTokenOptions, maxAge: 0 });
  return apiResponse(res, 200, "User logged out successfully");
});
