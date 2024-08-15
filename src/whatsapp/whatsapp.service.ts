import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from 'src/services/db/db.service';
import { OpenAiService } from 'src/services/open-ai/open-ai.service';
import { ChatCompletionMessageParam } from 'openai/resources';

interface CustomChatCompletionMessage {
  role: 'system' | 'user' | 'assistant'; // Roles comunes que no requieren 'name'
  content: string;
}
@Injectable()
export class WhatsappService {
  constructor(
    private readonly botService: OpenAiService,
    private readonly dbService: DbService,
  ) {}
  async create(messageDto: any) {
    console.log(messageDto.entry[0].changes[0]);
    try {
      if (!messageDto.entry[0].changes[0].value.messages[0]) return;
      const messageWebhook = messageDto.entry[0].changes[0].value.messages[0];
      switch (messageWebhook.type) {
        case 'text':
          this.handleMessage(messageWebhook)
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

  async sendMessage(message: string, to: string) {
    const response = await fetch(process.env.FACEBOOK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FACEBOOK_API_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      }),
    }).then(res => res.json());
    console.log(response)
  }

  async handleMessage(message: {
    from: string;
    id: string;
    timestamp: string;
    text: { body: string };
    type: string;
  }) {
    const conversationId = message.id;
    let conversation = null
    try {
      const conversationExist = await this.dbService.conversation.findFirst({
        where: { wappId: conversationId },
      });
      if (!conversationExist) {
         conversation = await this.dbService.conversation.create({
          data: {
            wappId: conversationId,
          },
        });
      }else {
        conversation = conversationExist
      }
      const history = await this.dbService.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: 'asc' },
      });
      const formattedHistory = history.map(
        message => {
          return { role: message.role, content: message.text };
        },
      );

      formattedHistory.push({ role: 'user', content: message.text.body });
  
      let result = await this.botService.generateText(formattedHistory as ChatCompletionMessageParam[]);
      await this.saveMessage('user', message.text.body, conversation.id);
      await this.saveMessage('model', result, conversation.id);
      await this.sendMessage(result, message.from);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  async saveMessage(role: string, text: string, conversationId: string) {
    await this.dbService.message.create({
      data: {
        role,
        text,
        conversationId,
      },
    });
  }
}
