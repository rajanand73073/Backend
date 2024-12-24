import { asyncHandler } from "../utils/asyncHandler.js"; 
import { APIError } from "../utils/APIError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResopnse } from "../utils/APIResponse.js";

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


const avatarLocalpath = req.files?.avatar[0]?.path || null;
const coverImageLocalPath= req.files?.coverImage[0]?.path || null;
console.log("required files:" ,req.files);

console.log("Request body:", req.body);
console.log("Files received:", req.files);

// if (!avatarLocalpath) {
//   throw new APIError(400,"Avatar File is required")
// }
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
  username:username.tolowecase()
})

const createdUser = await User.findById(user._id).select(
  "-password -refreshToken"
)
if(!createdUser){
  throw new APIError(500,"something Went wrong")
}
return res.status(201).json(
  new ApiResopnse(200,createdUser,'User registered Succesfully')
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

const {email,username,password} = req.body
if (!username || !email) {
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
const isPasswordValid = await user.isPasswordCorrect(password)
if (!isPasswordValid) {
  throw new APIError(404,"Invalid Password")
}

const {accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id)

const loggedInuser = await User.findById(user._id).
select("-password -refreshtoken")

const options = {
httpOnly:true,
secure:true
}
// when these two value will be stored as true  ,it means it only modified by server

return res.status(200)
.cookie("accessToken",accessToken,option)
.cookie("refreshToken",refreshToken,option)
.json(
  new ApiResopnse(
    200,{
      user:loggedInuser,accessToken,refreshToken
    },
    "User LoggedIn Successfully"
  )
)

})


//basically asyncHandler is used for hitting webrequest
const logoutUser  = asyncHandler(async(req,res)=>{
  // 1.clear cookies 
  //2. clear refreshtoken from usermodel
})

export {registerUser,loginUser,logoutUser}