import { Request, RequestHandler, Response, Router } from "express";
import { controllers } from "../../../controllers";
import { validateAuthentication } from "../../../middlewares/auth-middleware";
import { validateCreatePost } from "../../../middlewares/validate-posts";
import { CreatePostRequest } from "../../../types";
const { postController } = controllers

export const postRouter = Router()

postRouter.use(validateAuthentication as RequestHandler)

postRouter.post("/create",
  validateCreatePost as RequestHandler,
  async (req: Request, res: Response) => {
    await postController.createPost(req as CreatePostRequest, res)
  })

postRouter.get("/", async (req: Request, res: Response) => {
  await postController.getPosts(req, res)
})

postRouter.delete("/:id", async (req: Request, res: Response) => {
  await postController.deletePost(req, res)
})