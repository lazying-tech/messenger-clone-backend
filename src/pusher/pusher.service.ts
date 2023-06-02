import { Injectable } from '@nestjs/common';
import Pusher from 'pusher';
@Injectable()
export class PusherService {
  pusherServer: Pusher;
  constructor() {
    this.pusherServer = new Pusher({
      appId: '1610943',
      key: '9634a6662d275c93835a',
      secret: '9501ce892f5c2f2d6956',
      cluster: 'ap1',
      useTLS: true,
    });
  }

  async trigger(channel: string, message: string, data: any) {
    await this.pusherServer.trigger(channel, message, data);
  }
}
