import { asyncHandler } from "../utils/asyncHandler.js"
import { APIError } from "../utils/APIError.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
export const verifyJWT = asyncHandler(async (req, _ , next) => {
   // if we dont use any variable like res in this case we replace them with "_".
   
   try {
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
      if (!token) { 
         throw new APIError(401, "Unauthorized request")
      }
   //Steps in jwt.verify() or how it actually works:
   // Extract the Header and Payload from the token.
   // Recalculate the Signature using the same secret key (process.env.ACCESS_TOKEN_SECRET).
   // Compare the recalculated Signature with the one in the token.
   // If they match, the token is valid and the payload is trusted.
   // If the exp claim exists, check if the token is expired.
   // Return the decoded payload (e.g., userId, email) if everything is valid.
   const decodeToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
   // decodedToken contain all information or paylods like:username,email,id etc
   const user = await User.findById(decodeToken?._id).select("-password -refreshToken")
   if(!user){
      throw new APIError(401,"Inavalid Access Token")
   }
   req.user =user;
   next()
   } catch (error) {
      throw new APIError(401,error?.message||"Invalid Access Token")
   }
}) 

