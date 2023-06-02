import { Injectable } from '@nestjs/common';
import * as PusherServer from 'pusher';
@Injectable()
export class PusherService {
  pusherServer: PusherServer;
  constructor() {
    this.pusherServer = new PusherServer({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: 'ap1',
      useTLS: true,
    });
  }

  async trigger(channel: string, message: string, data: any) {
    await this.pusherServer.trigger(channel, message, data);
  }
}
