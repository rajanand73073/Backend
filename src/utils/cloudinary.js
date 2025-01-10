import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises'; // Use the promise-based version of fs
import path from 'path';
// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,  
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) {
        console.error("No file path provided for upload.");
        return null;
    }

    try {
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // Automatically detect file type
        });

        console.log("File successfully uploaded to Cloudinary:", response.url);
        fs.unlink(localFilePath); // Delete the local file after upload

        return response;
    } catch (error) {
        console.error("Error during file upload to Cloudinary:", error);

        // Attempt to delete the local file if upload fails
        try {
            await fs.unlink(localFilePath);
            console.log("Local file deleted after upload failure.");
        } catch (unlinkError) {
            console.error("Error deleting local file:", unlinkError);
        }

        return null; // Return null to indicate upload failure
    }
    
};


 
export { uploadOnCloudinary };
