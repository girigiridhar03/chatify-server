import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) return null;

    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
      folder: "chatapp/images",
    });
    await fs.promises
      .unlink(localfilepath)
      .catch((err) => console.error("Error deleting local file:", err));

    return response;
  } catch (error) {
    await fs.promises.unlink(localfilepath).catch(console.error(error));
    console.log("upload to cloudinary is failed", error);
    return null;
  }
};

export const deleteImageFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.log("deleting image is failed");
    return null;
  }
};
