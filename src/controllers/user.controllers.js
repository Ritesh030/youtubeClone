import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiErrors.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 
import { apiResponse } from "../utils/apiResponse.js";
import { isgmail } from "../utils/isgmail.js";


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
      console.log(avatar);
      
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
            throw new apiError(500,"Something went wrong while gerenating access adn refresh tokens")
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

      if(!username || !email){ // if none of them is there
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
      .json{
            new apiResponse(
                  200,
                  {
                        user: loggedInUser,accessToken,refreshToken
                  },
                  "User loggedIn successfully"
            )
      }
})
export { registerUser, loginUser }