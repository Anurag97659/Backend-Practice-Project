import {asyncHandler} from '../utils/asynchandler.js';
import {ApiError} from '../utils/Apierror.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiResponse}from '../utils/ApiResponse.js';

const registeruser = asyncHandler(async (req, res) => { 
    const { username, email, password,fullname } = req.body;
    console.log("email",email);
    console.log("password ",password);
    console.log("fullname ",fullname);
    console.log("username ",username);
    if(fullname===""){
        throw new ApiError(400,"fullname is required");
    }
    else if (password === "") {
        throw new ApiError(400, "password is required");
    }
    else if (email === "") {
        throw new ApiError(400, "email is required");
    }
    else if (username === "") {
        throw new ApiError(400, "username is required");
    }
   const checkingUserExistance= await  User.findOne({
        $or: [{  email }, {  username }]
    })
    if(checkingUserExistance){
        throw new ApiError(409,"user or email already exists");
    }
    
    const avatarLocalpath = req.files?.avatar[0]?.path;
    // const coverImageLocalpath = req.files?.coverImage[0]?.path; // it will give error if coverImage is not present in the request
    let coverImageLocalpath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalpath = req.files.coverImage[0].path
    }


    if(!avatarLocalpath){// this is aplicable when avatar is required
        throw new ApiError(400,"avatar is required");
    }
   const avatar = await uploadOnCloudinary(avatarLocalpath)
   const coverImage= await uploadOnCloudinary(coverImageLocalpath)
   if(!avatar){     // this is aplicable when avatar is required
       throw new ApiError(400,"avatar upload failed");
   }
   const user =await User.create({
         username,
         email,
         password,
         fullname,
         avatar:avatar.url,
         coverImage:coverImage?.url||""
   })
   const createUser = await User.findById(user._id).select("-password -refreshToken");
   if(!createUser){
       throw new ApiError(500,"user creation failed");
   }
//    return res.status(201).json({createUser}) // its the easy way to send response but we have already created a class for sending response which is ApiResponse
   return res.status(201).json(
        new ApiResponse(201, createUser,"user created successfully")
   )

});

export {registeruser};