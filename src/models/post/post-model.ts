import { model, Schema } from "mongoose";

const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
  },
  mediaIds: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true
})

PostSchema.index({ content: 'text' });

export const Post = model('Post', PostSchema);