import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { GoogleAiService } from 'src/services/google-ai/google-ai.service';
import { DbService } from 'src/services/db/db.service';
import { OpenAiService } from 'src/services/open-ai/open-ai.service';

@Module({
  controllers: [WhatsappController],
  providers: [WhatsappService, GoogleAiService, DbService, OpenAiService],
})
export class WhatsappModule {}
