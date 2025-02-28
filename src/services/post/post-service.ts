import { PostRepository } from "../../repositories/post/post-repository";
import { config } from "../../config";
import { GlobalErrorResponse } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { ValidateRequests } from "../validation/validation-service";
import { CreatePostRequest } from "../../types";
import { Request } from "express";
import { services } from "..";
const { logger } = config
export class PostService {
  constructor(private readonly postRepository: PostRepository) { }

  async invalidateCache(req: Request, input: string) {
    try {
      const indivitualCacheKey = `post:${input}`;
      await req?.redisClient?.del(indivitualCacheKey);
      const keys = await req?.redisClient?.keys('posts:*');
      if (keys?.length) {
        await req?.redisClient?.del(keys);
        logger.info(`Invalidated cache in service for keys: ${keys}`);
      }
    } catch (error) {
      logger.error(`Error invalidating cache in service: ${error.message}`)
      throw new GlobalErrorResponse(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  async createPost(req: CreatePostRequest) {
    try {
      logger.info(`Creating post with data in service: ${req?.body?.content}`)
      const requestBodyValidation = await ValidateRequests?.validateCreateUserRequestBody(req?.body);
      if (requestBodyValidation.error) {
        logger.error(`Error validating create post request body with content in Service: ${req?.body?.content}`);
        throw new GlobalErrorResponse(requestBodyValidation.error.message, StatusCodes.BAD_REQUEST);
      }
      const newPost = await this.postRepository.create(req?.body)
      if(newPost){
        await services.MessageBroker.publishEventToQueue("post.created", {
          postId: newPost?._id,
          userId: req?.user?.id,
          content: req?.body?.content,
        });
      }
      await this.invalidateCache(req, newPost?._id as string);
      return newPost
    } catch (error) {
      logger.error(`Error creating post in service: ${error.message}`)
      throw new GlobalErrorResponse(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }



  async getPosts(req: Request) {
    try {
      logger.info(`Getting all posts in service`)
      const currentPage = parseInt(req?.query?.page as string) || 1;
      const limit = parseInt(req?.query?.limit as string) || 10;
      const skip = (currentPage - 1) * limit;

      const cacheKey = `posts:${currentPage}:${limit}`;
      const cachedPosts = await req.redisClient?.get(cacheKey);
      if (cachedPosts) {
        logger.info(`Returning cached posts for page ${currentPage} with limit ${limit}`);
        return JSON.parse(cachedPosts);
      } else {
        logger.info(`No cached posts found for page ${currentPage} with limit ${limit}`);
        const posts = await this.postRepository.findAll(skip, limit);
        await req.redisClient?.setex(cacheKey, 300, JSON.stringify(posts));
        return posts;
      }
    } catch (error) {
      logger.error(`Error fetching posts in service: ${error.message}`)
      throw new GlobalErrorResponse(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  async getPostById(id: string) {
    try {
      logger.info(`Getting post by id in service: ${id}`)
      return await this.postRepository.findById(id)
    } catch (error) {
      logger.error(`Error fetching post by id in service: ${error.message}`)
      throw new GlobalErrorResponse(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  async updatePost(id: string, req: CreatePostRequest) {
    try {
      logger.info(`Updating post with id in service: ${id}`)
      return await this.postRepository.update(id, req)
    } catch (error) {
      logger.error(`Error updating post in service: ${error.message}`)
      throw new GlobalErrorResponse(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  async deletePost(req: Request) {
    try {
      const postId = req?.params?.id;
      const userId = req?.user?.id;

      if (!postId || !userId) {
        throw new GlobalErrorResponse("Post ID and User ID are required", StatusCodes.BAD_REQUEST);
      }

      logger.info(`Deleting post with id in service: ${postId}`);
      const deletedPost = await this.postRepository.delete(postId, userId);
      if (deletedPost) {
        await services.MessageBroker.publishEventToQueue("post.deleted", {
          postId,
          userId,
          mediaIds : deletedPost?.mediaIds,
        });
        await this.invalidateCache(req, postId);
      }
      return deletedPost;
    } catch (error) {
      logger.error(`Error deleting post in service: ${error.message}`);
      throw new GlobalErrorResponse(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

}