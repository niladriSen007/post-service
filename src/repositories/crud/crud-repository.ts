import { Document, Model } from "mongoose";
import { config } from "../../config";
import { CreatePostTypes } from "../../types";
const { logger } = config;

interface PaginatedResponse {
  total: number;
  data: Document[];
  currentPage: number;
  totalPages: number;
  limit: number;
}

export abstract class CrudRepository {
  constructor(private readonly model: Model<any>) { }

  async create(data: CreatePostTypes): Promise<Document> {
    logger.info(`Creating ${this.model.modelName} with data: ${JSON.stringify(data)}`);
    const body = new this.model(data);
    return await body.save();
  }

  async findById(id: string): Promise<Document | null> {
    logger.info(`Finding ${this.model.modelName} with id: ${id}`);
    return this.model.findById(id);
  }

  async findAll(skip: number, limit: number): Promise<PaginatedResponse> {
    logger.info(`Finding all ${this.model.modelName}`);
    const totalCounts = await this.model.countDocuments();
    return {
      total: totalCounts,
      data: await this.model.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      currentPage: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(totalCounts / limit),
      limit
    };
  }

  async update(id: string, data: any): Promise<Document | null> {
    logger.info(`Updating ${this.model.modelName} with id: ${id}`);
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string,userId : string): Promise<Document | null> {
    logger.info(`Deleting ${this.model.modelName} with id: ${id}`);
    return this.model.findOneAndDelete({
      _id: id,
      user: userId
    });
  }
}