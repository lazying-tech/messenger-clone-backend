/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
const Pusher = require('pusher');

@Injectable()
export class PusherService {
  pusherServer: any;
  constructor() {
    this.pusherServer = new (Pusher as any)({
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
