import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config({
    path: "/.env"
});



export const verifyJWT = asyncHandler(async (req, _, next) => {// we used _ instead of res because we are not using res in this function
   try{
        const token =req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
         if(!token){
                 throw new ApiError(401,"unauthorized");
        }
        // console.log("token",token);
        const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // console.log("decodedtoken = ",decodedtoken)
        const user = await User.findById(decodedtoken?._id).select("-password -refreshToken")
        if(!user){
                throw new ApiError(401,"Invaild Access Token");
         }
         req.user=user;
         next();
    }catch(err){
    throw new ApiError(401,`invalid access token ${err.message}`);
    }
});
