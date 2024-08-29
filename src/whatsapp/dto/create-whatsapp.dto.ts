import { IsArray, IsString, MinLength, ValidateNested } from "class-validator";

export class WebhookMessageDto {
  @IsString()
  object: string;

  @IsArray()
  entry: Entry[];
}

class Entry {
  @IsString()
  id: string;

  @IsArray()
  @MinLength(1, {
    message: "Changes must have at least one element"
  })
  changes: Change[]
}

class Change {
  @IsString()
  field: string;


  value: Value;
}

class Value {
  @IsArray()
  @MinLength(1, {
    message: "Messages must have at least one element"
  })
  messages: MessageDto[];
}

class MessageDto {
  @IsString()
  id: string;

  @IsString()
  from: string;

  @IsString()
  timestamp: string;

  text: Text;

  @IsString()
  type: string;

}

class Text {
  @IsString()
  body: string;
}