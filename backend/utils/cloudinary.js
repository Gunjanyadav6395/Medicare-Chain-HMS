import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

// Configure Cloudinary 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

//TO UPLOAD FILES TO CLOUDINARY
export async function uploadToCloudinary(filePath, folder = "Doctor") {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: "image"
        });
        // Delete the local file after uploading
        fs.unlinkSync(filePath);
        return  result;
    }
    catch (err) {
        console.error("Cloudinary upload error:", err);
        throw err;
    } 
}

//TO DELETE FILES FROM CLOUDINARY
export async function deleteFromCloudinary(publicId) {
    try {
        if (!publicId) return;
        await cloudinary.uploader.destroy(publicId);
    }
    catch (err) {
        console.error("Cloudinary deletion error:", err);
        throw err;
    }
}

export default cloudinary;;