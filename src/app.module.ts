import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { GoogleAiService } from './services/google-ai/google-ai.service';
import { DbService } from './services/db/db.service';
import { OpenAiService } from './services/open-ai/open-ai.service';
import { ProductsModule } from './products/products.module';
import { EncryptationService } from './services/encryptation/encryptation.service';
import { CloudinaryModule } from './services/cloudinary/cloudinary.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    WhatsappModule,
    ProductsModule,
    CloudinaryModule,
    
  ],
  controllers: [],
  providers: [GoogleAiService, DbService, OpenAiService, EncryptationService],
})
export class AppModule {}
