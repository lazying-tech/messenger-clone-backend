import { HttpStatus, Injectable } from '@nestjs/common';
import { MSG } from '../message';
import { PrismaService } from '../prisma/prisma.service';
import { PusherService } from '../pusher/pusher.service';

import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private prismaService: PrismaService,
    private pusherService: PusherService,
  ) {}

  async create(currentUserEmail: string, createMessageDto: any) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          email: currentUserEmail,
        },
      });
      const { message, image, conversationId } = createMessageDto;

      if (!user) {
        return MSG('Unauthorized', null, null, HttpStatus.UNAUTHORIZED);
      }
      const newMessage = await this.prismaService.message.create({
        data: {
          body: message,
          image: image,
          conversation: {
            connect: {
              id: conversationId,
            },
          },
          sender: {
            connect: {
              id: user.id,
            },
          },
          seen: {
            connect: {
              id: user.id,
            },
          },
        },
        include: {
          seen: true,
          sender: true,
        },
      });

      const updatedConversation = await this.prismaService.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          lastMessageAt: new Date(),
          messages: {
            connect: {
              id: newMessage.id,
            },
          },
        },
        include: {
          users: true,
          messages: {
            include: {
              seen: true,
            },
          },
        },
      });
      await this.pusherService.trigger(
        conversationId,
        'message:new',
        newMessage,
      );
      const lastMessage =
        updatedConversation.messages[updatedConversation.messages.length - 1];

      updatedConversation.users.map((user) => {
        this.pusherService.trigger(user.email!, 'conversation:update', {
          id: conversationId,
          messages: [lastMessage],
        });
      });
      return MSG('Done', newMessage, null, HttpStatus.OK);
    } catch (err: any) {
      return MSG(
        'Internal Error',
        null,
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findAll() {
    return `This action returns all messages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
