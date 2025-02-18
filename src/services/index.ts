import { PostService } from "./post/post-service";
import { repositories } from "../repositories";
const {postRepository} = repositories;
export const services = {
  postService: new PostService(postRepository),
}