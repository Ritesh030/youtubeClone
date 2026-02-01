import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import { CLOUDINARY_API_KEY } from "../constants.js"
import { CLOUDINARY_CLOUD_NAME } from "../constants.js"
import { CLOUDINARY_API_SECRET } from "../constants.js"

cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(
      localFilePath,
      { resource_type: "auto" }
    );

    console.log("File has been successfully uploaded on cloudinary", response.url);

    fs.unlinkSync(localFilePath); // cleanup after successful upload
    return response;

  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

export { uploadOnCloudinary }