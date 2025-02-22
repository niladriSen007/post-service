import Joi from 'joi';
import { CreatePostTypes } from "../../types";
export class ValidateRequests {
  public static async validateCreateUserRequestBody(data: CreatePostTypes) {
    const schema = Joi.object({
      content: Joi.string().min(1).max(200).required(),     
      user: Joi.string().required(),
      mediaIds: Joi.array().required()
    });
    return schema.validate(data);
  }

}