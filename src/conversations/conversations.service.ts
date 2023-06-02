import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MSG } from 'src/message';

import { UpdateConversationDto } from './dto/update-conversation.dto';
import { PusherService } from 'src/pusher/pusher.service';

@Injectable()
export class ConversationsService {
  constructor(
    private prismaService: PrismaService,
    private pusherService: PusherService,
  ) {}

  async create(currentUserEmail: string, createConversationDto: any) {
    try {
      const { userId, isGroup, members, name } = createConversationDto;
      const user = await this.prismaService.user.findUnique({
        where: {
          email: currentUserEmail,
        },
      });

      if (!user) {
        return MSG('Unauthorized', null, null, HttpStatus.UNAUTHORIZED);
      }

      if (isGroup && (!members || members?.length < 2 || !name))
        return MSG('Invalid data', null, null, HttpStatus.BAD_REQUEST);

      if (isGroup) {
        const newConversation = await this.prismaService.conversation.create({
          data: {
            name,
            isGroup,
            users: {
              connect: [
                ...members.map((member: { value: string }) => ({
                  id: member.value,
                })),
                { id: user.id },
              ],
            },
          },
          include: {
            users: true,
          },
        });

        newConversation.users.forEach((user) => {
          if (user.email) {
            this.pusherService.trigger(
              user.email,
              'conversation:new',
              newConversation,
            );
          }
        });

        return MSG(
          'Created Group Conversation !',
          newConversation,
          null,
          HttpStatus.OK,
        );
      }

      const existingConversation =
        await this.prismaService.conversation.findMany({
          where: {
            OR: [
              {
                userIds: {
                  equals: [user.id, userId],
                },
              },
              {
                userIds: {
                  equals: [userId, user.id],
                },
              },
            ],
          },
        });

      const singleConversation = existingConversation[0];

      if (singleConversation) {
        return MSG(
          'Single Conversation already created!',
          singleConversation,
          null,
          HttpStatus.OK,
        );
      }

      const newConversation = await this.prismaService.conversation.create({
        data: {
          users: {
            connect: [{ id: user.id }, { id: userId }],
          },
        },
        include: {
          users: true,
        },
      });
      newConversation.users.map((user) => {
        if (user.email) {
          this.pusherService.trigger(
            user.email,
            'conversation:new',
            newConversation,
          );
        }
      });
      return MSG(
        'Created Single Conversation',
        newConversation,
        null,
        HttpStatus.OK,
      );
    } catch (err: any) {
      return MSG(
        'Internal Error',
        null,
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createSeen(currentUserEmail: string, conversationId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          email: currentUserEmail,
        },
      });

      if (!user) {
        return MSG('Unauthorized', null, null, HttpStatus.UNAUTHORIZED);
      }

      // Find the existing conversation
      const conversation = await this.prismaService.conversation.findUnique({
        where: {
          id: conversationId,
        },
        include: {
          messages: {
            include: {
              seen: true,
            },
          },
          users: true,
        },
      });

      if (!conversation) {
        return MSG('Invalid ID', null, null, HttpStatus.BAD_REQUEST);
      }

      // Find the last message
      const lastMessage =
        conversation.messages[conversation.messages.length - 1];

      if (!lastMessage) {
        return MSG('Conversation', conversation, null, HttpStatus.ACCEPTED);
      }
      // Update seen of last message
      const updatedMessage = await this.prismaService.message.update({
        where: {
          id: lastMessage.id,
        },
        include: {
          sender: true,
          seen: true,
        },
        data: {
          seen: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      await this.pusherService.trigger(user.email, 'conversation:update', {
        id: conversationId,
        messages: [updatedMessage],
      });

      // if we has seen last message ->
      if (lastMessage.seenIds.indexOf(user.id) !== -1) {
        return MSG('DONE!', conversation, null, HttpStatus.OK);
      }

      // if we has not seen last message -> alert people we seen
      await this.pusherService.trigger(
        conversationId,
        'message:update',
        updatedMessage,
      );

      return MSG('DONE!', updatedMessage, null, HttpStatus.OK);
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
    return `This action returns all conversations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} conversation`;
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  async remove(id: string, currentUserEmail: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          email: currentUserEmail,
        },
      });

      if (!user) {
        return MSG('Unauthorized', null, null, HttpStatus.UNAUTHORIZED);
      }

      const existingConversation =
        await this.prismaService.conversation.findUnique({
          where: {
            id: id,
          },
          include: {
            users: true,
          },
        });

      if (!existingConversation) {
        return MSG('Invalid ID', null, null, HttpStatus.BAD_REQUEST);
      }

      const deletedConversation =
        await this.prismaService.conversation.deleteMany({
          where: { id: id, userIds: { hasSome: [user.id] } },
        });

      existingConversation.users.forEach((user) => {
        if (user.email) {
          this.pusherService.trigger(
            user.email,
            'conversation:remove',
            existingConversation,
          );
        }
      });

      return MSG('Deleted!!', deletedConversation, null, HttpStatus.OK);
    } catch (err: any) {
      return MSG(
        'Internal Error',
        null,
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
