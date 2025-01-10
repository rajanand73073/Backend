import { asyncHandler } from "../utils/asyncHandler.js"; 
import { APIError } from "../utils/APIError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/APIResponse.js";
import  jwt  from "jsonwebtoken";
import mongoose from "mongoose";
//always name method that reprsents its functionality


const generateAccessAndRefreshTokens = async(userId)=> {
  try {
  const user= await User.findById(userId)
  const accessToken= user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()

  user.refreshToken = refreshToken
  await user.save({validateBeforeSave :false})
return {accessToken,refreshToken}


  } catch (error) {
    throw new APIError(500,"Something went wrong while generating refresh and access token")
  }
}

 
const registerUser = asyncHandler (async(req,res)=>{
   //step1:getting userDetails  from frontend 
   //validation -nothing empty
   //check if user is already exist:username,email
   // check for images,check for avatar
   //upload them to cloudinary
   //create userObject-create entry in db
   //remove password and refresh token field from response
   //check for user creation
   //return res

  const {fullname,email,username,password}= req.body
  console.log('email',email);
  console.log("requitred files:" ,req.files);

  if (
    [fullname,email,username,password].some((field)=>
        field?.trim() ==="")
  ){
throw new APIError(400,"All fields are required")
  } 
const existedUser= await User.findOne({
  $or:[{username},{email}]
})
console.log("user",existedUser);

console.log("Request body:", req.body);
console.log("Files received:", req.files);

if (existedUser) {
  throw new APIError(409,"User With email or Username already exist")
}
console.log("Request body:", req.body);
console.log("Files received:", req.files);


const avatarLocalpath = req.files?.avatar[0]?.path;
// const coverImageLocalPath= req.files?.coverImage[0]?.path || null;
console.log("required files:" ,req.files);

console.log("Request body:", req.body);
console.log("Files received:", req.files);

// if (!avatarLocalpath) {
//   throw new APIError(400,"Avatar File is required")
// }
let coverImageLocalPath;
if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
}


if (!avatarLocalpath) {
  throw new APIError(400, "Avatar file is required.");
}
console.log("Request body:", req.body);
console.log("Files received:", req.files);


if (!coverImageLocalPath) {
  console.warn("Cover image not provided. Proceeding without it.");
}

const avatar = await uploadOnCloudinary(avatarLocalpath)
const  coverImage = await uploadOnCloudinary(coverImageLocalPath)

if(!avatar){
  throw new APIError(400,"Avatar File is required")
}
const user = await User.create({
  fullname,
  avatar:avatar.url,
  coverImage:coverImage?.url||"",
  email,
  password,
  username:username
})

const createdUser = await User.findById(user._id).select(
  "-password -refreshToken"
)
if(!createdUser){
  throw new APIError(500,"something Went wrong")
}
return res.status(201).json(
  new ApiResponse(200,createdUser,'User registered Succesfully')
)
console.log("Request body:", req.body);
console.log("Files received:", req.files);

})



const loginUser = asyncHandler(async (req,res)=>{
// steps to be performed when login
//1.validate Username or email
//2.validate password 
//3.Then generate access & refresh tokens
// send cookies & respond successfuly loggedin
console.log('Headers:', req.headers);
const {email,username,password} = req.body
console.log("req.body:",req.body);

if (!(username || email) ){
  throw new APIError(400,"Username or email is required")
}
//.findOne() method is used to retrieve a single document from a collection that matches a specified query. It’s commonly used when you expect or only need one matching result.
 const user = await User.findOne({
  $or: [{username},{email}]
 })
 // user contain the whole document/object related on the basis of my  findone result.
if (!user) {
  throw new APIError (404,"User doesnot exist")
}
console.log(user);

const isPasswordValid = await user.isPasswordCorrect(password)
if (!isPasswordValid) {
  throw new APIError(404,"Invalid Password")
}

const {accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id)
console.log(accessToken,refreshToken);

const loggedInuser = await User.findById(user._id)
.select("-password -refreshToken")

console.log(loggedInuser);
console.log('Headers:', req.headers);

const options = {
httpOnly:true,
secure: true
}
// when these two value will be stored as true  ,it means it only modified by server

return res.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
  new ApiResopnse(
    200,{
      user:loggedInuser,accessToken,refreshToken
    },
    "User LoggedIn Successfully"
  )
)

})


const logoutUser = asyncHandler(async (req,res)=>{
await User.findByIdAndUpdate(
req.user.id,{
  $set :{
   refreshToken: undefined
  }
},
{
  new:true
}
)
//for removing cookies
const options = {
  httpOnly:true,
  secure:true
  }
  console.log(req.user);
  
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(
    new ApiResopnse(200,{},"User Logged Out Successfully")
  )


  
}) 

const refreshAccessToken = asyncHandler(async(req,res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if (!incomingRefreshToken) {
    throw new APIError(401,"Unauthorized Access")
  }
try {
  const decodedToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
  const user = await User.findById(decodedToken?._id)
  if (!user) {
    throw new APIError("Invalid RefreshToken");
  }
  if (incomingRefreshToken !== user?.refreshToken) {
    throw new APIError(" RefreshToken is expired or used");
  }
  const options={
    httpOnly:true,
    security:true
  }
   const {accessToken,newrefreshToken}= await generateAccessAndRefreshTokens(user._id)
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",newrefreshToken,options)
  .json(
    new ApiResopnse(
      200,
      {accessToken,newrefreshToken}
      ,"Access token refreshed"
    )
  )
} catch (error) {
  throw new APIError(401,error?.message||"Invalid Refresh Token")
}
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
  const{oldPassword,newPassword} = req.body

  const user= await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new APIError (400,"Invalid Old Password")
  }

  user.password = newPassword
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(new ApiResponse(200,{},"Password Changed Successfully"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
  console.log(req.user);
  
  return res
  .status(200)
  .json(new ApiResponse(200,req.user,"Current User Details fetched Successfully"))
}) 


const updateAccountDetails = asyncHandler(async(req,res)=>{
  const {fullname,email} = req.body
  if (!fullname || !email) {
    throw new APIError(400,"All fields are required")
  }

 const user = User.findByIdAndUpdate(
    req.user?._id,
{
  new:true
},
{
  $set:{
fullname,
email:email
  }
}

  ).select("-password")
return res
.status(200)
.json(new ApiResopnse(200,"Account details updated Successfully"))
})


const updateUserAvatar = asyncHandler(async(req,res)=>{
const avatarLocalPath = req.file?.path

if(!avatarLocalPath){
  throw new APIError(400,"Avatar file is missing")
}
const avatar = await uploadOnCloudinary(avatarLocalPath)

if(!avatar.url){
  throw new APIError(400,"Error while uploading on avatar");
}

 const user= await User.findByIdAndUpdate(
  req.user?._id,
  {
    $set:{
      avatar:avatar.url
}
  },
  {
    new:true
  }
).select("-password")
return res
   .status(200)
   .json(new ApiResopnse(200,user,"Avatar updated Succesfully"))
  })

const updateUserCoverImage = asyncHandler(async(req,res)=>{
  const coverImageLocalPath = req.file?.path
  
  if(!coverImageLocalPath){
    throw new APIError(400,"coverimage file is missing")
  }
  const coverImage = await uploadOnCloudinary(avatarLocalPath)
  
  if(!coverImage.url){
    throw new APIError(400,"Error while uploading on coverimage");
  }
  
   const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage:coverImage.url
  }
    },
    {
      new:true
    }
  ).select("-password")
  

   return res
   .status(200)
   .json(new ApiResponse(200,user,"coverImage updated Succesfully"))
  })


const getUserChannelProfile=asyncHandler(async(req,res)=>{

  const {username} =  req.params;
console.log(username);

  if (!username?.trim()) {
    throw new APIError(401,"Username required");  
  }

  const Channel = await User.aggregate([
    {
      $match: {
        username: username,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "Subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "SubscribedTO",
      },
    },
    {
      $addFields: {
        SubscribersCount: {
          $size: { $ifNull: ["$Subscribers", []] },
        },
        SubscribedTOCount: {
          $size: { $ifNull: ["$SubscribedTO", []] },
        },
        IsSubscribed: {
          $cond: {            if: { $in: [req.user?._id, { $ifNull: ["$Subscribers.subscriber", []] }] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        fullname: 1,
        SubscribedTOCount: 1,
        SubscribersCount: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        IsSubscribed: 1,
        createdAt: 1,
      },
    },
  ]);
  console.log(Channel);
  
  if (!Channel?.length) {
    throw new APIError(404, "Channel not found");
  }
  
  return res
    .status(200)
    .json(new ApiResponse(200, Channel[0], "Channel Profile fetched Successfully"));
})  
const getWatchHistory = asyncHandler(async(req,res)=>{
const user = await User.aggregate([
  {$match:{
    _id: await new mongoose.Types.ObjectId(req.user._id)
  }},
  {
    $lookup:{
      from:"videos",
      localField:"watchHistory",
      foreignField:"_id",
      as:"WatchHistory",
      pipeline:[
        {
          $lookup:{
             
          }
        }
      ]
    }
  }
])


})





export {
  registerUser,loginUser,
  logoutUser,refreshAccessToken,
  changeCurrentPassword,getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,updateUserCoverImage,
  getUserChannelProfile
}