import { apiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ACCESS_TOKEN_SECRET } from "../constants.js";

export const verifyJWT = asyncHandler(async(req,res,next) => {
      try {
            const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","") // or part is if the user is using mobile app
      
            if(!token){
                  throw new apiError(401,"Unauthorized request")
            }
      
            const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);
      
            const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
      
            if(!user){
                  throw new apiError(401,"Invlid access token")
            }
      
            req.user = user;
            next()
      } catch (error) {
            throw new apiError(401,error?.message || "Invalid access token")
            
      }
})