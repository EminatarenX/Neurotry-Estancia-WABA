import { Controller, Get, Post, Body, Query, Req, Res } from "@nestjs/common";
import { WhatsappService } from "./whatsapp.service";
import { WebhookMessageDto } from "./dto/create-whatsapp.dto";
import { Request, RequestHandler, Response } from "express";

@Controller("whatsapp")
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post()
  async handleMessage(@Req() request: Request, @Res() response: Response, @Body() messageDto: WebhookMessageDto) {
    if (
      messageDto.entry[0].changes[0].value &&
      messageDto.entry[0].changes[0].value.messages &&
      messageDto.entry[0].changes[0].value.messages[0]
    ) {
      const message = messageDto.entry[0].changes[0].value.messages[0];
      await this.whatsappService.handleMessage(message);
      return response.status(200).send("EVENT_RECEIVED");
    } else {
      return 
    }
  }

  @Get()
  verify(
    @Query("hub.verify_token") verifyToken: string,
    @Query("hub.challenge") challenge: string,
  ) {
    return this.whatsappService.verify(verifyToken, challenge);
  }

  @Get('payments/success')
  async handlePaymentSuccess(@Query() query: any) {
    return this.whatsappService.handlePaymentSuccess(query);
  }
  @Get('payments/cancel')
  async handlePaymentCancel(@Query() query: any) {
    return this.whatsappService.handlePaymentCancel(query);
  }

  @Post('payments/webhook')
  async handlePaymentWebhook(@Req() req: Request, @Res() res: Response) {
    return this.whatsappService.handlePaymentWebhook(req, res);
  }

  @Post('flows/webhook') 
  async handleFlowWebhook(@Req() request: Request, @Res() response: Response) {
    return this.whatsappService.handleEncryptedMessage(request, response);
  }
}
