import { PostController } from "./post/post-controller";
import { services } from "../services";
const { postService } = services;

export const controllers = {
  postController: new PostController(postService),
}