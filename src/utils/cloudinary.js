import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({
  path: "./.env",
});

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log(`Video uploaded successfully`, uploadResult.url);
    fs.unlinkSync(localFilePath);
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log(`Error uploading video: ${error}`);
    return null;
  }
};

export { uploadOnCloudinary };
