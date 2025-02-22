import { PostService } from "./post/post-service";
import { MessageBroker } from "./broker/message-broker-service";
import { repositories } from "../repositories";
const { postRepository } = repositories;
export const services = {
  postService: new PostService(postRepository),
  MessageBroker
}