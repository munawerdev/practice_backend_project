import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token = (
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace(/^Bearer\s+/i, "")
    )?.trim();

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      throw new ApiError(500, "ACCESS_TOKEN_SECRET is not configured");
    }

    const decodedToken = jwt.verify(token, secret);

    const userId = decodedToken?._id || decodedToken?.id;
    if (!userId) {
      throw new ApiError(401, "Invalid Access Token");
    }

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
