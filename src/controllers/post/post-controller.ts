import { Request, Response } from "express";
import { PostService } from "../../services/post/post-service";
import { CreatePostRequest } from "../../types";
import { StatusCodes } from "http-status-codes";
import { errorResponse, successResponse } from "../../utils";
import { config } from "../../config";
const { logger } = config

export class PostController {
  constructor(private readonly postService: PostService) { }

  async createPost(req: CreatePostRequest, res: Response) {
    try {
      logger.info(`Creating post with data in controller: ${JSON.stringify(req.body?.content)}`)
      const post = await this.postService.createPost(req)
      successResponse.data = post
      successResponse.message = "Post created successfully"
      logger.info(`Post created successfully with data: ${JSON.stringify(post)}`)
      res.status(StatusCodes.CREATED).json(successResponse)
    } catch (err) {
      logger.error(`Error creating post in controller: ${err.message}`)
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message })
    }
  }

  async getPosts(req: Request, res: Response) {
    try {
      logger.info(`Getting all posts in controller`)
      const posts = await this.postService.getPosts(req)
      successResponse.data = posts
      successResponse.message = "Posts fetched successfully"
      logger.info(`Posts fetched successfully with data: ${JSON.stringify(posts)}`)
      res.status(StatusCodes.OK).json(successResponse)
    } catch (err) {
      logger.error(`Error fetching posts in controller: ${err.message}`)
      errorResponse.message = err.message
      errorResponse.error.stack = err.stack
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse)
    }
  }

  async getPostById(req: Request, res: Response) {
    try {
      logger.info(`Getting post by id in controller: ${req?.params?.id}`)
      const post = await this.postService.getPostById(req?.params?.id)
      successResponse.data = post || {}
      successResponse.message = "Post fetched successfully"
      logger.info(`Post fetched successfully with data: ${JSON.stringify(post)}`)
      res.status(StatusCodes.OK).json(successResponse)
    } catch (err) {
      logger.error(`Error fetching post by id in controller: ${err.message}`)
      errorResponse.message = err.message
      errorResponse.error.stack = err.stack
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse)
    }
  }

  async updatePost(req: Request, res: Response) {
    try {
      logger.info(`Updating post in controller: ${req?.params?.id}`)
      const post = await this.postService.updatePost(req?.params?.id, req.body)
      successResponse.data = post || {}
      successResponse.message = "Post updated successfully"
      logger.info(`Post updated successfully with data: ${JSON.stringify(post)}`)
      res.status(StatusCodes.OK).json(successResponse)
    } catch (err) {
      logger.error(`Error updating post in controller: ${err.message}`)
      errorResponse.message = err.message
      errorResponse.error.stack = err.stack
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse)
    }
  }

  async deletePost(req: Request, res: Response) {
    try {
      logger.info(`Deleting post in controller: ${req?.params?.id}`)
      const post = await this.postService.deletePost(req)
      successResponse.data = post || {}
      successResponse.message = "Post deleted successfully"
      logger.info(`Post deleted successfully with data: ${JSON.stringify(post)}`)
      res.status(StatusCodes.OK).json(successResponse)
    } catch (err) {
      logger.error(`Error deleting post in controller: ${err.message}`)
      errorResponse.message = err.message
      errorResponse.error.stack = err.stack
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse)
    }
  }
}