import mongoose from "mongoose";

const PostSchema = mongoose.Schema(
  {
    postMsg: { type: String, required: true },
    email: { type: String,required: true},
    lat:{type:Number},
    lng:{type:Number},
    likes: {count: { type: Number, default: 0 }, users: { type: [String], default: []}},
  },
  {timestamps: {createdAt: true, updatedAt: false}}
);

const PostModel = mongoose.model("Posts", PostSchema);

export default PostModel;
