import { asyncHandler } from "../utils/asyncHandler.ts";
import { ApiError } from "../utils/ApiError.ts";
import { User } from "../models/user.model.ts";
import { uploadOnCloudinary } from "../utils/cloudinary.ts";
import { ApiResponse } from "../utils/ApiResponse.ts";
import type { Types } from "mongoose";

const generateAccessAndRefreshTokens = async (
  userId: string | Types.ObjectId
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body;

  // 1. Check required fields
  if (
    [username, email, fullname, password].some(
      (field) => typeof field !== "string" || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const trimmedUsername = username.trim().toLowerCase();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedFullname = fullname.trim();

  // 2. Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ username: trimmedUsername }, { email: trimmedEmail }],
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  // 3. Handle file uploads
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] | undefined }
    | undefined;

  const avatarLocalPath = files?.avatar?.[0]?.path;

  let coverImageLocalPath: string | undefined;
  if (files && Array.isArray(files.coverImage) && files.coverImage.length > 0) {
    coverImageLocalPath = files.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar");
  }

  // 4. Create user
  const user = await User.create({
    username: trimmedUsername,
    email: trimmedEmail,
    fullname: trimmedFullname,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // 1. Check identifier and password
  if (
    (!username || typeof username !== "string" || username.trim() === "") &&
    (!email || typeof email !== "string" || email.trim() === "")
  ) {
    throw new ApiError(400, "username or email is required");
  }

  if (!password || typeof password !== "string") {
    throw new ApiError(400, "password is required");
  }

  // 2. Find user by username or email
  const conditions: Array<{ username: string } | { email: string }> = [];
  if (username && typeof username === "string" && username.trim() !== "") {
    conditions.push({ username: username.trim().toLowerCase() });
  }
  if (email && typeof email === "string" && email.trim() !== "") {
    conditions.push({ email: email.trim().toLowerCase() });
  }

  const user = await User.findOne({ $or: conditions });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // 3. Verify password
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // 4. Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // 5. Fetch fresh user without sensitive fields
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // 6. Set cookies and send response
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized request");
  }

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 }, // removes the field entirely
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
