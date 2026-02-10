import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiErrors.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 
import { apiResponse } from "../utils/apiResponse.js";
import { isgmail } from "../utils/isgmail.js";
import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET } from "../constants.js";
import { json } from "express";


const registerUser = asyncHandler(async (req, res) => {
      //// steps for user registration
      // 1.get use details for frontend
      // 2.check if the feilds are empty
      // 3.check if the user already exists : by username/email
      // 4.check for the required feilds
      // 5.check for image, avatar
      // 6.upload image and avatar on cloudinary
      // 7.create user object in database
      // 8.remove user password and refreah tokens from response feild
      // 9.check for the user creation
      // 10.return response


      // step - 1 -->
      const { fullName, email, password, username } = req.body

      // step -2 -->
      // if(fullName === ""){
      //       throw new apiError(400,"Fullname is required")     
      // }
      if (
            [fullName, email, password, username].some((field) => field?.trim() === "")
      ) {
            throw new apiError(400, "All fields are required")
      }





      // function isgmail(email) {
      //       return gmail.endswith("@gmail.com") // can have something like -- @gmail.com so don't use this 
      // }

      if (!isgmail(email)) {
            throw new apiError(400, "Enter correct email")
      }

      // step - 3 -->
      const existedUser = await User.findOne({
            $or: [{ username }, { email }]
      }) // this will return true if any one of them exists

      if (existedUser) {
            throw new apiError(409, "User already exists with this username or email")
      }
      
      // step - 5 -->
      const avatarLocalPath = req.files?.avatar?.[0]?.path; // req.files is provited by multer      
      const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

      if(!avatarLocalPath){
            throw new apiError(400, "Avatar file is required")
      }

      // step - 6 -->
      const avatar = await uploadOnCloudinary(avatarLocalPath)
      const coverImage = await uploadOnCloudinary(coverImageLocalPath)
      
      if(!avatar){
            throw new apiError(400, "Avatar file not uploaded to cloudinary")
      }

      // step - 7 -->
      const userInstance = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "", // as coverimage may or may not be available
            email,
            password,
            username: username.toLowerCase()
      })

      // step - 8 & 9 -->
      const createdUser = await User.findById(userInstance._id).select(
            "-password -refreshToken"
      )
      if(!createdUser){
            throw new apiError(500, "Something went wrong while registering a user")
      }

      // step - 10 -->
      return res.status(201).json(
            new apiResponse(201, createdUser, "User registered successfully")
      )
})

const generateAccessAndRefreshToken = async(userId) => {
      try {
            const user = await User.findById(userId);
            const accessToken = user.generateAccessToken()
            const refreshToken = user.generateRefreshToken()
            user.refreshToken = refreshToken
            await user.save({validateBeforeSave: false})

            return {accessToken, refreshToken}
      } catch (error) {
            throw new apiError(500,"Something went wrong while gerenating access and refresh tokens")
      }
}
const loginUser = asyncHandler(async (req,res) => {
      // steps -->
      // get data from body
      // take username or email for login
      // find the user
      // check for password
      // generate access and refresh tokens
      // send cookie

      const {username, email, password} = req.body;

      if(!(username || email)){ // if none of them is there
            throw new apiError(400,"Username or email and password is required")
      }

      const user = await User.findOne({
            $or: [{username}, {email}]
      })

      if(!user){
            throw new apiError(404,"User does not exists")
      }

      const ispassswordvalid = await user.isPasswordCorrect(password);

      if(!ispassswordvalid){
            throw new apiError(401,"Invalid password");
      }

      const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

      const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

      const options = {
            httpOnly: true,
            secure: true
      }

      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
            new apiResponse(
                  200,
                  {
                        user: loggedInUser, accessToken, refreshToken
                  },
                  "User loggedIn successfully"
            )
      )
})
const logoutUser = asyncHandler(async(req,res) => {
      // now i have the access of req.user here because of the autho middleware(as it adds the user to req.user if the user it identified) and in the middleware auth is called first route (logout)

      await User.findByIdAndUpdate(
            req.user._id,
            {
                  $set: {
                        refreshToken: undefined
                  }
            },
            {
                  new: true   
            }
      )

      const options = {
            httpOnly: true,
            secure: true
      }

      return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new apiResponse(200, {}, "User loggedout"))
})

const refreshAccessToken = asyncHandler(async(req,res) => {
      const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

      if(!incomingRefreshToken){
            throw new apiError(401, "Unauthorized user");
      }

      try {
            const decodedToken = jwt.verify(
                  incomingRefreshToken,
                  REFRESH_TOKEN_SECRET
            )
      
            const user = await User.findById(decodedToken?._id);
      
            if(!user){
                  throw new apiError(401,"Invalid refreah token");
            }
      
            if(incomingRefreshToken !== user?.refreshToken){
                  throw new apiError(401,"refresh token is expired or used");
            }
      
            const options = {
                  httpOnly: true,
                  secure: true
            }
      
            const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id);
      
            return res
            .status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken", newRefreshToken,options)
            .json(
                  new apiResponse(
                        200,
                        {accessToken, refreshToken: newRefreshToken},
                        "Access token refreshed"
                  )
            )
      } catch (error) {
            throw new apiError(401, error?.message || "Invailid refresh token")
      }
})

const changeCurrentPassword = asyncHandler(async(req,res) => {
      const {oldPassword, newPassword, confirmPassword} = req.body
      
      const user = await User.findById(req.user?._id);

      const ispassswordvalid = await user.isPasswordCorrect(oldPassword);
      if(!ispassswordvalid){
            throw new apiError(400, "Incorrect oldPassword");
      }

      if(newPassword === oldPassword){
            throw new apiError(400, "Use different password");
      }
      if(newPassword !== confirmPassword){
            throw new apiError(400, "newPassword and confirmPassword fields should be same")
      }

      user.password = newPassword;
      await user.save({validateBeforeSave: false})
      
      return res
      .status(200)
      .json(new apiResponse(200, {},"Password changed successfully"))
})

const updateUserDetails = asyncHandler(async(req,res) => {
      const {username, fullName, email} = req.body;

      if(!(username || fullName || email)){
            return new apiError(400, "One of the field is required for updation")
      }

      const user = await User.findById(req.user?._id);
      if(!user){
            throw new apiError(400,"user not found");
      }

      const oneMonth = 30 * 24 * 60 * 60 * 1000;

      if(username && username !== user.username && user.usernameLastChangedAt && 
            Date.now() - user.usernameLastChangedAt.getTime() < oneMonth
      ){
            throw new apiError(400, "Username can only be updated once per month")
      }

      user.username = username ?? user.username;
      user.fullName = fullName ?? user.fullName;
      user.email = email ?? user.email;

      if(username && username !== user.username){
            user.usernameLastChangedAt = new Date();
      }

      await user.save({validateBeforeSave:false}).select("-password -refreshToken")

      return res
      .status(200)
      .json(new apiResponse(200, user, "Account Details Updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res) => {
      const avatarLocalPath = req.file?.path;
      if(!avatarLocalPath){
            throw new apiError(400, "avatar file is missing while updation")
      }

      const avatar = await uploadOnCloudinary(avatarLocalPath)

      if(!avatar.url){
            throw new apiError(400, "Error while uploading avatar file to cloudinary while updation")
      }

      const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                  $set: {
                        avatar: avatar.url
                  }
            },
            {new: true}
      ).select("-password -refreshToken")

      return res
      .status(200)
      .json(new apiResponse(200, user, "Avatar file updated successfully"))
})

const updateUserCoverImage = asyncHandler(async(req,res) => {
      const coverImageLocalPath = req.file?.path
      if(!coverImageLocalPath){
            throw new apiError(400, "coverimage file is required for updation")
      }

      const coverImage = await uploadOnCloudinary(coverImageLocalPath)
      if(!coverImage.url){
            throw new apiError(400,"error while uploading coverimage while updation")
      }

      const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                  $set: {
                        coverImage: coverImage.url
                  }
            },
            {new: true}
      ).select("-password -refreshToken")

      return res
      .status(200)
      .json(new apiResponse(200, user, "coverImage updated successfully"))
})
export { 
      registerUser,
      loginUser, 
      logoutUser, 
      refreshAccessToken, 
      changeCurrentPassword, 
      updateUserDetails, 
      updateUserAvatar,
      updateUserCoverImage
}