import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';

@Injectable()
export class OpenAiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateText(
    messages: Array<ChatCompletionMessageParam>,
    model: string = 'gpt-3.5-turbo',
  ): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      messages,
      model: model,
    });

    
    return completion.choices[0].message.content;
  }
}
