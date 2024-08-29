import { Module } from "@nestjs/common";
import { WhatsappService } from "./whatsapp.service";
import { WhatsappController } from "./whatsapp.controller";
import { GoogleAiService } from "src/services/google-ai/google-ai.service";
import { DbService } from "src/services/db/db.service";
import { OpenAiService } from "src/services/open-ai/open-ai.service";
import { EncryptationService } from "src/services/encryptation/encryptation.service";
import { CloudinaryModule } from "src/services/cloudinary/cloudinary.module";

@Module({
  controllers: [WhatsappController],
  providers: [
    WhatsappService,
    GoogleAiService,
    DbService,
    OpenAiService,
    EncryptationService,
  ],
  imports: [CloudinaryModule]
})
export class WhatsappModule {}
