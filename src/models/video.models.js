import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
      {
            videoFile: {
                  type: String, // cloudenary url
                  requred: true
            },
            thumbnail: {
                  type: String, // cloudenary url
                  requred: true
            },
            title: {
                  type: String,
                  requred: true
            },
            description: {
                  type: String,
                  requred: true
            },
            duration: {
                  type: Number,
                  required: true
            },
            views: {
                  type: Number,
                  default: 0
            },
            isPublished: {
                  type: Boolean,
                  default: true
            },
            owner: {
                  type: Schema.Types.ObjectId,
                  ref: "User"
            },
            transcript: {
                  type: String,
                  default: null
            },
            summary: {
                  type: String,
                  default: null
            },
            summaryGeneratedAt: {
                  type: Date,
                  default: null
            }
      }, { timestamps: true }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)