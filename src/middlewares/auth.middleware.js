import { asyncHandler } from "../utils/asyncHandler"
import { APIError } from "../utils/APIError.js"
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, res, next) => {
   
   
   const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
   if (!token) { 
      throw new APIError(401, "Unauthorized request")
   }

const decodeToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
})

