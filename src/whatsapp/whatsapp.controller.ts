import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { CreateWhatsappDto } from './dto/create-whatsapp.dto';
import { UpdateWhatsappDto } from './dto/update-whatsapp.dto';
import { MessageDto } from './dto/message.dto';

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService

  ) {}

  @Post()
  create(@Body() messageDto: any) {
    return this.whatsappService.create(messageDto);
  }

  @Get()
  verify(@Query('hub.verify_token') verifyToken: string, @Query('hub.challenge') challenge: string) {
    return this.whatsappService.verify(verifyToken, challenge);
  }


}
