import { BadRequestException, Injectable, OnModuleInit } from "@nestjs/common";
import { DbService } from "src/services/db/db.service";
import { OpenAiService } from "src/services/open-ai/open-ai.service";
import { ChatCompletionMessageParam } from "openai/resources";
import { Conversation, PrismaClient } from "@prisma/client";
import { GoogleAiService } from "src/services/google-ai/google-ai.service";
import { MessageDto } from "./dto/message.dto";
import { InteractiveMessage } from "./interfaces/interactive-message.interface";
import { RegisterResponse } from "./interfaces/register-response.interface";
import { sendRegistrationFetch } from "./constants/send-registration-message.fetch";
import { sendMessageFetch } from "./constants/send-message.fetch";
import { Request, Response } from "express";
import crypto from "crypto";
import { envs } from "src/config/envs";
import Stripe from "stripe";
import { EncryptationService } from "src/services/encryptation/encryptation.service";
import { CloudinaryService } from "src/services/cloudinary/cloudinary.service";
import { sendCatalogFetch } from "./constants/send-catalog.fetch";
import { getNextScreen } from "./constants/gen-next-screen";

@Injectable()
export class WhatsappService {
  private readonly stripe = new Stripe(envs.stripeSecret);
  constructor(
    private readonly googleAiService: GoogleAiService,
    private readonly openAiService: OpenAiService,
    private readonly dbService: DbService,
    private readonly encryptService: EncryptationService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  verify(verifyToken: string, challenge: string) {
    if (verifyToken === process.env.SECRET_WPP_TOKEN && challenge)
      return challenge;
    else throw new BadRequestException("Invalid verify token");
  }

  async handleMessage(messageDto: any) {
    // console.log(JSON.stringify(messageDto));
    switch (messageDto.type) {
      case "text":
        this.handleTextMessage(messageDto);
        // this.handleTextMessageAI(messageDto);
        break;
      case "interactive":
        this.handleInteractiveMessage(messageDto);
        break;
      default:
        break;
    }
  }

  async handleInteractiveMessage(message: InteractiveMessage) {
    const responseParsed = JSON.parse(
      message.interactive.nfm_reply.response_json
    );
    if (Object.keys(responseParsed)[0] === "products") {
      console.log("products received");
      console.log(responseParsed);
      return;
    } else if (responseParsed.type === "feedback") {
      console.log("feedback received");
      console.log(responseParsed);
      const client = await this.dbService.user.findFirst({
        where: { phone: message.from },
      });
      const response = await this.googleAiService.generateFeedbackMessage(
        responseParsed.feedback_text,
        client.name
      );
      await this.sendMessage(response, message.from);
      return;
    }
    return;
    const payload: RegisterResponse = JSON.parse(
      message.interactive.nfm_reply.response_json
    );
    const exist = await this.dbService.user.findUnique({
      where: { email: payload.email },
    });

    if (exist) {
      await this.sendMessage(
        "Este correo ya ha sido registrado con enterioridad, intenta de nuevo 🙏 ",
        message.from
      );
    } else {
      try {
        const user = await this.dbService.user.create({
          data: {
            email: payload.email,
            name: payload.name,
            phone: message.from,
            password: payload.password,
          },
        });
        await this.sendMessage(
          `Gracias por registrarte ${user.name}, ahora puedes comenzar a comprar productos con tu asistente Duna 🚀`,
          message.from
        );
        await this.sendMessage(
          `En que puedo ayudarte hoy? 🤔\n_____________________\nComprar un producto de nuestra tienda 🛍️\nVer todos mis pedidos 📦\n Ver información de mi cuenta 📊~
          `,
          message.from
        );
      } catch (error) {
        await this.sendMessage(
          "Ocurrió un error al registrar tu cuenta, intenta de nuevo 🙏",
          message.from
        );
      }
    }
  }

  async handleTextMessage(message: MessageDto) {
    console.log({ message_received: message.text.body });
    const clientService = await this.googleAiService.evaluateClientResponse(
      message.text.body.toLowerCase()
    );
    if (clientService.isWelcome) {
      this.isWelcome(message);
      return;
    } else if (clientService.wantToBuy && !clientService.catalog) {
      this.wantToBuy(message);
      return;
    } else if (clientService.isGivingThanks) {
      this.isThanks(message);
      return;
    } else if (clientService.isAccountInformation) {
      this.isAccountInformation(message);
      return;
    } else if (clientService.wantToBuy && clientService.catalog) {
      const products = await this.googleAiService.evaluateExtractedProducts(
        clientService.catalog
      );
      this.handleBuyProduct(message, products);
      return;
    } else {
      this.didNotUnderstand(message);
      return;
    }
  }

  async handleBuyProduct(
    message: MessageDto,
    products: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>
  ) {
    // Mapea los productos existentes a los lineItems para Stripe
    const lineItems = products.map((product, index) => ({
      price_data: {
        currency: "mxn",
        product_data: {
          name: product.name,
        },
        unit_amount: Math.round(products[index].price * 100), // Precio en centavos
      },
      quantity: products[index].quantity, // Cantidad del producto original
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {
          orderId: "12345",
          phone: message.from,
        },
      },
      line_items: lineItems,
      mode: "payment",
      success_url:
        "https://r945484c-3000.use2.devtunnels.ms/api/v1/whatsapp/payments/success",
      cancel_url:
        "https://r945484c-3000.use2.devtunnels.ms/api/v1/whatsapp/payments/cancel",
    });

    await this.sendMessage(
      `En seguida enviamos el link para que puedas completar tu compra 🛍️`,
      message.from
    );
    await this.sendMessage(`${session.url}`, message.from, true);
    await this.sendMessage(
      `Este link tiene una duración de 24 horas, si no completas tu compra en ese tiempo, deberás solicitar uno nuevo 🕒`,
      message.from
    );
  }

  async didNotUnderstand(message: MessageDto) {
    await this.sendMessage(
      `Lo siento, no entendí tu mensaje, ¿puedes repetirlo? 🙏`,
      message.from
    );
  }
  async wantToBuy(message: MessageDto) {
    try {
      const isRegistered = await this.dbService.user.findUnique({
        where: { phone: message.from },
      });
      if (!isRegistered) {
        await this.sendMessage(
          `Hola, parece que no estás registrado en nuestra plataforma, ¿te gustaría registrarte?`,
          message.from
        );
        this.sendRegistrationMessage(message.from);
      } else {
        await this.sendMessage(
          `Enseguida te muestro los productos disponibles en nuestra tienda 🛍️`,
          message.from
        );
        const products = await this.dbService.product.findMany();
        const productsList = products.map((product) => ({
          id: product.id,
          title: product.name,
          description: `$${product.price}`,
          image: "[image_base64]",
          // image: product.image,
        }));
        const productsListImages = products.map((product) => ({
          id: product.id,
          title: product.name,
          description: `$${product.price}`,
          image: product.image,
        }));
        console.log({
          processing_data: {
            process: "generating_json_flow",
            status: "pending",
          },
        });

        // console.log({ flow_generated: json });

        await sendCatalogFetch(message.from, { products: productsListImages });
        const flow_generated =
          await this.googleAiService.generateJSONProductsCatalog(
            productsList,
            productsListImages
          );
        //  const productsList = products.map((product) => ({
        //     name: product.name,
        //     price: product.price,
        //  }));

        //  const productsListString = productsList.map(( product, index) => {
        //   return `${index + 1}. ${product.name} *$${product.price}* ✅\n`;
        //  }).toString().replace(/,/g, "");

        // await this.sendMessage(
        //   `Productos disponibles:\n\n${productsListString}`,
        //   message.from
        // );
      }
    } catch (error) {
      await this.sendMessage(
        `Ocurrió un error al intentar obtener los productos, intenta de nuevo 🙏`,
        message.from
      );
    }
  }

  async isWelcome(message: MessageDto) {
    const user = await this.dbService.user.findUnique({
      where: { phone: message.from },
    });
    if (user)
      await this.sendMessage(
        `Hola de nuevo ${user.name.split(" ")[0]} 🤗, ¿en qué puedo ayudarte hoy? 🤔\n\n
1️⃣ Comprar un producto 🛍️\n 2️⃣ Ver mis pedidos 📦\n 3️⃣ Ver información de mi cuenta 📊`,
        message.from
      );
    else
      await this.sendMessage(
        `Hola, soy Duna, tu asistente virtual, ¿en qué puedo ayudarte hoy? 🤗`,
        message.from
      );
  }

  async isThanks(message: MessageDto) {
    const user = await this.dbService.user.findUnique({
      where: { phone: message.from },
    });
    if (user)
      await this.sendMessage(
        `De nada, es un placer ayudarte ${user.name.split(" ")[0]} 🤗`,
        message.from
      );
    else {
      await this.sendMessage(
        `Gracias por tu mensaje, ¿te gustaría registrarte?`,
        message.from
      );
      this.sendRegistrationMessage(message.from);
    }
  }

  async isAccountInformation(message: MessageDto) {
    const user = await this.dbService.user.findUnique({
      where: { phone: message.from },
    });
    if (user) {
      await this.sendMessage(
        `En seguida te muestro la información de tu cuenta`,
        message.from
      );
      await this.sendMessage(
        `Nombre: ${user.name}\nCorreo: ${user.email}\nTelefono: ${user.phone}`,
        message.from
      );
    } else {
      await this.sendMessage(
        `Parece que no estás registrado en nuestra plataforma, ¿te gustaría registrarte?`,
        message.from
      );
      this.sendRegistrationMessage(message.from);
    }
  }

  async sendRegistrationMessage(to: string) {
    await sendRegistrationFetch(to);
  }
  async sendMessage(message: string, to: string, previewUrl?: boolean) {
    await sendMessageFetch(to, message, previewUrl);
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

  async handleEncryptedMessage(req: Request, res: Response) {
    if (!envs.FACEBOOK_PRIVATE_KEY) {
      throw new Error(
        'Private key is empty. Please check your env variable "PRIVATE_KEY".'
      );
    }
    if (!this.isRequestSignatureValid(req)) {
      return res.status(432).send();
    }

    let decryptedRequest = null;
    try {
      decryptedRequest = this.encryptService.decryptRequest(
        req.body,
        envs.FACEBOOK_PRIVATE_KEY,
        envs.FACEBOOK_PHRASE_PRIVATE_KEY
      );
    } catch (err) {
      console.error(err);
      if (err instanceof this.encryptService.FlowEndpointException) {
        return res.status(400).send();  
      }
      return res.status(500).send();
    }

    const { aesKeyBuffer, initialVectorBuffer, decryptedBody } =
      decryptedRequest;
    console.log("💬 Decrypted Request:", decryptedBody);
 
    const screenResponse = await getNextScreen(decryptedBody );
    console.log("👉 Response to Encrypt:", screenResponse);

    res.send(this.encryptService.encryptResponse(screenResponse, aesKeyBuffer, initialVectorBuffer));
  }
  isRequestSignatureValid(req: any) {
    if(!envs.FACEBOOK_PHRASE_PRIVATE_KEY) {
      console.warn("App Secret is not set up. Please Add your app secret in /.env file to check for request validation");
      return true;
    }
  
    const signatureHeader = req.get("x-hub-signature-256");
    const signatureBuffer = Buffer.from(signatureHeader.replace("sha256=", ""), "utf-8");
  
    const hmac = crypto.createHmac("sha256", envs.FACEBOOK_PHRASE_PRIVATE_KEY);
    const digestString = hmac.update(req.rawBody).digest('hex');
    const digestBuffer = Buffer.from(digestString, "utf-8");
  
    if ( !crypto.timingSafeEqual(digestBuffer, signatureBuffer)) {
      console.error("Error: Request Signature did not match");
      return false;
    }
    return true;
  }

  handlePaymentSuccess(query: any) {}
  handlePaymentCancel(query: any) {}

  async handlePaymentWebhook(req: Request, res: Response) {
    const sig = req.headers["stripe-signature"];
    let event: Stripe.Event;
    //testing
    // const endpointSecret = "whsec_cd04392924531b37234e3e45b32d47072386ae046905a5c1f85d5413b5b80bdb";
    const endpointSecret = envs.stripeSecretEndpoint;
    try {
      event = this.stripe.webhooks.constructEvent(
        req["rawBody"],
        sig,
        endpointSecret
      );
    } catch (error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
      return;
    }

    switch (event.type) {
      case "charge.succeeded":
        const chargeSucceded = event.data.object;
        const payload = {
          stripePaymentId: chargeSucceded.id,
          orderId: chargeSucceded.metadata.orderId,
          receipUrl: chargeSucceded.receipt_url,
        };

        await this.sendMessage(
          `Tu pago ha sido procesado con éxito, aquí está tu recibo: ${payload.receipUrl}`,
          chargeSucceded.metadata.phone
        );

      default:
    }
    return res.status(200).json({ sig });
  }
}
