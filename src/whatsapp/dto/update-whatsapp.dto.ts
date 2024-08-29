import { PartialType } from '@nestjs/mapped-types';
import { WebhookMessageDto } from './create-whatsapp.dto';

export class UpdateWhatsappDto extends PartialType(WebhookMessageDto) {}
