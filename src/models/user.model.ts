import { Schema, model, type Model, type Types } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";

export interface IUser {
  username: string;
  email: string;
  fullname: string;
  avatar: string;
  coverImage?: string;
  watchHistory: Types.ObjectId[];
  password: string;
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserMethods {
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

export type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: { type: String, required: true, trim: true, index: true },
    avatar: { type: String, required: true },
    coverImage: { type: String },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: { type: String, required: [true, "Password is required"] },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }

  return jwt.sign(
    {
      _id: this._id,
      id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    secret,
    {
      expiresIn: (process.env.ACCESS_TOKEN_EXPIRY ||
        "1d") as SignOptions["expiresIn"],
    }
  );
};

userSchema.methods.generateRefreshToken = function (): string {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error("REFRESH_TOKEN_SECRET is not defined");
  }

  return jwt.sign(
    {
      _id: this._id,
      id: this._id,
    },
    secret,
    {
      expiresIn: (process.env.REFRESH_TOKEN_EXPIRY ||
        "10d") as SignOptions["expiresIn"],
    }
  );
};

export const User = model<IUser, UserModel>("User", userSchema);
