import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from "dotenv";
dotenv.config({
    path: "/.env"
});


cloudinary.config({
    cloud_name: process.env.CLOUDUNARY_CLOUD_NAME,
    api_key: process.env.CLOUDUNARY_API_KEY,
    api_secret: process.env.CLOUDUNARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, { //uploading file on cloudinary
            resource_type: "auto"
        })
         
        console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath) // this is important to remove the locally saved temporary file after the file is uploaded on cloudinary other wise it will be stored in the locally in your system for example in this code it will be saved in public folder
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}



export {uploadOnCloudinary}