import {asyncHandler} from '../utils/asynchandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiResponse}from '../utils/ApiResponse.js';

const registeruser = asyncHandler(async (req, res) => { 

    const { username, email, password,fullname } = req.body;
    // console.log("email",email);
    // console.log("password ",password);
    // console.log("fullname ",fullname);
    // console.log("username ",username);

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

   // check if user already exists 
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

const generateAccessTokenandRefreshToken = async(userid)=>{// due to multiple use of this function we have created a function
    try{
        const user=await User.findById(userid);
        const accessToken = user.generateAccessToken() // already created in the User model
        const refreshToken = user.generateRefreshToken()// already created in the User model
        user.refreshToken=refreshToken; // sending refresh token to the user in the database
        await user.save({validateBeforeSave:false});// saving the refresh token in the database and validate and validateBeforeSave is false because we are not validating the refresh token like it will ask for password and all which is required for the user creation but not for the refresh token that is why we have used validateBeforeSave as false
        return{accessToken,refreshToken};
    }
    catch(error){
        throw new ApiError(500,"token generation failed while generating access token and refresh token");
    }
}

const loginuser = asyncHandler(async (req, res) => {

    const {email,username,password} = req.body;

    if(!email || !username){
        throw new ApiError(400,"email or username is required");
    }

    const user= await User.findOne({
        $or:[{email},{username}]
    })

    if(!user){
        throw new ApiError(404,"user not found");
    }
 
    const ispasswordright= await user.isPasswordCorrect(password);
    if(!ispasswordright){
        throw new ApiError(401,"password is incorrect");
    }

    const {accessToken,refreshToken} = await generateAccessTokenandRefreshToken(user._id);
    const loggeduser = await User.findById(user._id).select("-password -refreshToken"); // we redeined the user because we did not have the refresh token in the user object

    const options ={ // this is the option for the cookie so that it can be manipulate by the server only
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)  // to use cookie kindly install cookie-parser through npm
    .cookie("refreshToken",refreshToken,options)
    .json(
        // new ApiResponse(200,loggeduser,"user logged in successfully")
        new ApiResponse(
        200,
        {
            user:loggeduser,
            accessToken,
            refreshToken
        },
        "user logged in successfully"
        )
    ) 
});

const logoutuser =asyncHandler(async(req,res)=>{
    
})
export {registeruser,loginuser};