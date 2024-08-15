import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { GoogleAiService } from './services/google-ai/google-ai.service';
import { DbService } from './services/db/db.service';
import { OpenAiService } from './services/open-ai/open-ai.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    WhatsappModule,
    
  ],
  controllers: [],
  providers: [GoogleAiService, DbService, OpenAiService],
})
export class AppModule {}
