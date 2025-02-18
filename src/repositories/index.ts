import { PostRepository } from "./post/post-repository";

export const repositories = {
  postRepository: new PostRepository(),
};