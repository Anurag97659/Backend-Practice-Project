import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import jwt from "jsonwebtoken";
import {ApiResponse}from '../utils/ApiResponse.js';
import dotenv from "dotenv";
dotenv.config({
    path: "/.env"
});

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


    // if(!avatarLocalpath){// this is aplicable when avatar is required
    //     throw new ApiError(400,"avatar is required");
    // }

   const avatar = await uploadOnCloudinary(avatarLocalpath)
   const coverImage= await uploadOnCloudinary(coverImageLocalpath)

//    if(!avatar){     // this is aplicable when avatar is required
//        throw new ApiError(400,"avatar upload failed");
//    }

   const user =await User.create({
         username,
         email,
         password,
         fullname,
         avatar:avatar?.url||"",
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
        throw new ApiError(500,`token generation failed while generating access token and refresh token ${error.message}`);
    }
}

const loginuser = asyncHandler(async (req, res) => {

    const {email,username,password} = req.body;

    if(!email && !username){
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
    await User.findByIdAndUpdate(  
        req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new:true
        }
    )

    const options ={ 
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"user logged out successfully")
    )
    
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"unathorized request");
    }
    try {
        const decodedtoken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)    
        const user =  User.findById(decodedtoken?._id)
        if(!user){
            throw new ApiError(401,"user not found by refresh token")
        }
        if(incomingRefreshToken != user?.refreshToken){
            throw new ApiError(400," refresh token does not match -> Invalid refresh token ")
        }
        // now updating the tokens
        const option = {
            httpOnly:true,
            secure:true
        }
        const {accessToken,newrefreshToken}= await generateAccessTokenandRefreshToken(user._id);
        return res.
        status(200)
        .cookie("accessToken",accessToken,option)
        .cookie("refreshToken",newrefreshToken,option)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken:newrefreshToken
                },
                " access token updated"
            )
        )
    } catch (error) {
        throw new ApiError(400,`INVALID REFRESH TOKEN ${error.message} `)
    }

})   

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const{oldPassword,newPassword,confirmPassword}=req.body
    if(newPassword != confirmPassword){
        throw new ApiError(401,"new password and confirm password are different")
    }
    const user =  await User.findById(req.user?._id)
    const isPasswordCorrect =  await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(401,"wrong old password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave:false})
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password Changed Successfully OOO YEAH !!"
        )
    )
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    // console.log("req.user",req.user);
    return res
    .status(200)
    .json(
            200,
            req.user ,            
            `current user fetched successfully ${req.user?.username}`        
    )
})

const udateDetails = asyncHandler(async(req,res)=>{
    // content_type: "multipart/form-data"
    const { username, email } = req.body;
    if(! username && ! email){
        throw new ApiError(400," username and email is required");
    }
    
    console.log( "!!! OLD DETAILS !!!  = ",req.user);
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {$set:{
            username:username,
            email:email
        }},
        {new: true}
    ).select("-password")
    console.log( "!!! NEW DETAILS !!!  = ",user);
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "DETAILS UPDATED SUCCESSFULLY"
        )
    )
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
    //TODO: delete old image - assignment
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }
    //TODO: delete old image - assignment
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params // we are using params instead of body because we are fetching the data not sending the data
    if(!username?.trim()){// trim is used to remove the white spaces or the spaces from the string
        throw new ApiError(400,"username is required")
    }
   const channer =  await User.aggregate([
    {
        $match:{ // match is used to filter the data from the database 
            username:username?.toLowerCase()
        } 
    },
    {
        $lookup:{
            from:"subscriptions", // this is where the data coming from
            localField:"_id", // this is the field of the user model
            foreignField:"channel", // this is the field of the subscription model
            as:"subscribers" // this is the name of the field which will be used to store the data
        }
    },
    {
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribedTO"
        }
    },
    {
        $addFields:{
            subscriberCount:{$size:"$subscribers"},
            subscribedTOCount:{$size:"$subscribedTO"} ,
            isSubscribed:{
                $cond:{ // this is the condition to check if the user is subscribed or not
                    if:{$in:[req.user?._id,"$subscribers.subscriber"]}, // $in is used to check if the user is present in the subscribers array or not
                    then:true,
                    else:false
                }
            }  
        }
    },
    {
        $project:{  // this is used to project the data which we want to show to the user
            fullname:1,
            username:1,
            avatar:1,
            coverImage:1,
            subscriberCount:1,
            subscribedTOCount:1,
            email:1,
            isSubscribed:1 
        }
    }
   ])
//    console.log("channer",channer);
   if(!channer?.length){
       throw new ApiError(404,"channel not found")
   }
   return res
   .status(200)
    .json(
         new ApiResponse(
              200,
              channer[0],
              "channel profile fetched successfully"
         )
    )
})

const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id) //we could have used req.user._id directly but we have used mongoose.Types.ObjectId because we are using mongoose aggregate function and it requires the id in the form of mongoose.Types.ObjectId, basically we are converting the string id to the mongoose.Types.ObjectId
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner", 
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                // $arrayElemAt:["$owner",0] // this can be done in one more way 
                                $first:"$owner" // this is used to get the first element of the array
                            }
                        }
                    }
                ]
            }
        },
       
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "watch history fetched successfully"
        )
    )

})
export {
    registeruser,
    loginuser,
    logoutuser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    udateDetails,
    updateUserCoverImage,
    updateUserAvatar,
    getUserChannelProfile,
    getWatchHistory
};