import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';

import { UpdateConversationDto } from './dto/update-conversation.dto';

@Controller('api/v1/conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  create(@Headers() headers, @Body() createConversationDto: any) {
    return this.conversationsService.create(
      headers.currentuserheader,
      createConversationDto,
    );
  }

  @Post(':conversationId/seen')
  createSeen(
    @Headers() headers: any,
    @Param('conversationId') conversationId: any,
  ) {
    return this.conversationsService.createSeen(
      headers.currentuserheader,
      conversationId,
    );
  }

  @Get()
  findAll() {
    return this.conversationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationsService.update(+id, updateConversationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers() headers: any) {
    return this.conversationsService.remove(id, headers.currentuserheader);
  }
}
