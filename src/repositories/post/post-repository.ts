import { Request } from "express";
import { config } from "../../config";
import { models } from "../../models";
import { CreatePostRequest } from "../../types";
import { CrudRepository } from "../crud/crud-repository";
const { logger } = config
const { Post } = models

export class PostRepository extends CrudRepository {
  constructor() {
    super(Post)
  }
  async createPost(req: Request ) {
    logger.info(`Creating post with data: ${JSON.stringify(req?.body)}`)
    const { mediaIds, content } = req.body
    const post = new Post({
      mediaIds: mediaIds || [],
      content,
      userId: req?.user?.id,
    })
    return await post.save()
  }

  async getPosts() {
    logger.info(`Getting all posts`)
    return await Post.find()
  }

  async getPostById(id: string) {
    logger.info(`Getting post by id: ${id}`)
    return await Post.findById(id)
  }

  async updatePost(id: string, req: CreatePostRequest) {
    logger.info(`Updating post with id: ${id}`)
    return await Post.findByIdAndUpdate(id, req.body, { new: true })
  }

  async deletePost(id: string) {
    logger.info(`Deleting post with id: ${id}`);
    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) {
      logger.error(`Post with id: ${id} not found`);
    }
    
    return deletedPost;
  }
}