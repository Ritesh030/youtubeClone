import mongoose, { Schema } from "mongoose";
import jwk from "jsonwebtoken";
import bcrypt from "bcrypt"
import { ACCESS_TOKEN_SECRET } from "../constants.js"
import { ACCESS_TOKEN_EXPIRY } from "../constants.js"
import { REFRESH_TOKEN_SECRET } from "../constants.js"
import { REFRESH_TOKEN_EXPIRY } from "../constants.js"

const userSchema = new Schema(
      {
            username: {
                  type: String,
                  required: true,
                  lowercase: true,
                  unique: true,
                  trim: true,
                  index: true
            },
            email: {
                  type: String,
                  required: true,
                  lowercase: true,
                  unique: true,
                  trim: true
            },
            fullName: {
                  type: String,
                  required: true,
                  trim: true,
                  index: true
            },
            avatar: {
                  type: String, // Cloudinary url
                  required: true
            },
            coverImage: {
                  type: String, // Cloudinary url
            },
            watchHistory: [
                  {
                        type: Schema.Types.ObjectId,
                        ref: "Video"
                  }
            ],
            password: {
                  type: String,
                  required: [true, "Password is required"]
            },
            refreshToken: {
                  type: String
            }
      }, { timestamps: true }
)


// Run this middleware BEFORE saving a user document to the database
// we cannot use arrow function here because arrow fuction does not have reference to (this) keyword
userSchema.pre("save", async function (next) {

    // Only hash the password if it was created or changed
    // This prevents re-hashing an already-hashed password on every save like email, username, etc.. updates
    if (this.isModified("password")) {
        // Hash the plain-text password using bcrypt
        // 10 is the salt rounds (cost factor)
        // Higher = more secure but slower
        this.password = await bcrypt.hash(this.password, 10); //// Wait for the async operation to finish before using its result
    }

    // Move on to the next middleware or complete the save operation
    next();
});

// inject new method for cheking the password
userSchema.methods.isPasswordCorrect = async function (password) {
      return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function () {
      return jwt.sign(
            {
                  _id: this._id,
                  email: this.email,
                  username: this.username,
                  fullName: this.fullName
            },
            ACCESS_TOKEN_SECRET,
            {
                  expiresIn: ACCESS_TOKEN_EXPIRY
            }
      )
}

userSchema.methods.generateRefreshToken = function () {
      return jwt.sign(
            {
                  _id: this._id
            },
            REFRESH_TOKEN_SECRET,
            {
                  expiresIn: REFRESH_TOKEN_EXPIRY
            }
      )
}

export const User = mongoose.model("User", userSchema)