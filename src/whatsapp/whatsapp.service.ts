import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWhatsappDto } from './dto/create-whatsapp.dto';
import { UpdateWhatsappDto } from './dto/update-whatsapp.dto';
import { MessageDto } from './dto/message.dto';
import { InteractiveMessage } from './interfaces/message-interactive';

@Injectable()
export class WhatsappService {
  async create(messageDto: any) {
    try {
      if (!messageDto.entry[0].changes[0].value.messages[0]) return;
      const messageWebhook = messageDto.entry[0].changes[0].value.messages[0];
      switch (messageWebhook.type) {
        case 'text':
          console.log(messageWebhook);
          break;
        case 'interactive':
          console.log(messageWebhook);
          break;
        default:
          break;
      }
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  verify(verifyToken: string, challenge: string) {
    if (verifyToken === process.env.SECRET_WPP_TOKEN && challenge)
      return challenge;
    else throw new BadRequestException('Invalid verify token');
  }

  findAll() {
    return `This action returns all whatsapp`;
  }

  findOne(id: number) {
    return `This action returns a #${id} whatsapp`;
  }

  update(id: number, updateWhatsappDto: UpdateWhatsappDto) {
    return `This action updates a #${id} whatsapp`;
  }

  remove(id: number) {
    return `This action removes a #${id} whatsapp`;
  }
}
