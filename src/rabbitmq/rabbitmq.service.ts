import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async onModuleInit() {
    this.connection = await amqp.connect(
      process.env.RABBITMQ_URL || 'amqp://localhost',
    );
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue('user.created');
  }

  async onModuleDestroy() {
    await this.channel.close();
    await this.connection.close();
  }

  getChannel(): amqp.Channel {
    return this.channel;
  }
}
