import { config } from "../../config"
import ampqlib from 'amqplib';
import { GlobalErrorResponse } from "../../utils";
import { StatusCodes } from "http-status-codes";
const { logger, serverConfig } = config


export class MessageBroker {

  private static connection: ampqlib.Connection | null = null;
  private static channel: ampqlib.Channel | null = null;
  private static readonly EXCHANGE = "facebook_events"
  public static async createConnectionRabbitMQ() {
    try {
      this.connection = await ampqlib.connect(serverConfig.RABBITMQ_URI);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.EXCHANGE, 'topic', { durable: true });
      logger.info("RabbitMQ connection created successfully")
      return this.channel;
    } catch (error) {
      logger.error(`Error creating connection to RabbitMQ: ${error.message}`)
      throw new GlobalErrorResponse(`Error creating connection to RabbitMQ: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }

  public static async publishEventToQueue(routingKey: string, message: Record<string, any>) {
    try {
      if (!this.channel) {
        await this.createConnectionRabbitMQ();
      }
      this.channel?.publish(this.EXCHANGE, routingKey, Buffer.from(JSON.stringify(message)));
      logger.info(`Event published to RabbitMQ with routing key: ${routingKey}`);
    } catch (error) {
      logger.error(`Error publishing event to RabbitMQ: ${error.message}`)
      throw new GlobalErrorResponse(`Error publishing event to RabbitMQ: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR)

    }
  }
}