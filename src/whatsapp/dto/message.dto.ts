import { IsString, IsArray, ValidateNested, IsObject, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class TextDto {
  @IsString()
  body: string;
}

export class MessageDto {
  @IsString()
  from: string;

  @IsString()
  id: string;

  @IsString()
  timestamp: string;

  @IsObject()
  @ValidateNested()
  @Type(() => TextDto)
  @IsOptional()
  text?: TextDto;

  @IsString()
  type: string;
}

class ProfileDto {
  @IsString()
  name: string;
}

class ContactDto {
  @IsString()
  wa_id: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ProfileDto)
  profile: ProfileDto;
}

class MetadataDto {
  @IsString()
  display_phone_number: string;

  @IsString()
  phone_number_id: string;
}

class ValueDto {
  @IsString()
  messaging_product: string;

  @IsObject()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata: MetadataDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  contacts: ContactDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];
}

class ChangeDto {
  @IsString()
  field: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ValueDto)
  value: ValueDto;
}

class EntryDto {
  @IsString()
  id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChangeDto)
  changes: ChangeDto[];
}

export class WhatsAppMessageDto {
  @IsString()
  object: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EntryDto)
  entry: EntryDto[];
}
