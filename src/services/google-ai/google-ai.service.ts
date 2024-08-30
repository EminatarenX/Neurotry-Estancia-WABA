import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { CatalogJSON } from "./json_flow_interface";

interface MessageEvaluated {
  isWelcome: boolean;
  wantToBuy: boolean;
  isGivingThanks: boolean;
  isAccountInformation: boolean;
  catalog: null | Array<{ name: string; quantity: number; price: number }>;
  isOrders: boolean;
}

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

@Injectable()
export class GoogleAiService extends PrismaClient implements OnModuleInit {
  private genAI: GoogleGenerativeAI;
  public model: GenerativeModel;

  constructor() {
    super();
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async generateText(
    history: Array<any>,
    model: string = "gemini-pro"
  ): Promise<string> {
    this.model = this.genAI.getGenerativeModel({ model });
    const chat = this.model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 100,
      },
    });
    const lastMessage = history[history.length - 1].parts[0].text;
    const result = await chat.sendMessage(lastMessage);
    const response = result.response;
    const text = response.text();

    return text;
  }

  async evaluateClientResponse(
    messageToEvaluate: string
  ): Promise<MessageEvaluated> {
    const prompt = `Voy a darte un mensaje de un cliente y quiero que me devuelvas **únicamente** un objeto JSON que indique lo que el cliente quiere. Evalúa el mensaje según los siguientes parámetros:

- Si el cliente está saludando o es alguien nuevo: { isWelcome: true }
- Si el cliente quiere comprar algo o ver el catalogo de productos: { wantToBuy: true }
- Si el cliente quiere comprar y selecciona uno o mas productos: { wantToBuy: true, catalog: [{name: "product_name", quantity: 1, price: 1} }
- Si el cliente está agradeciendo o dando las gracias: { isGivingThanks: true }
- Si el cliente quiere información de su cuenta: { isAccountInformation: true }
- Si el cliente quiere ver sus pedidos: { isOrders: true }


El JSON debe seguir este formato exacto:
{
  "isWelcome": false,
  "wantToBuy": false,
  "isGivingThanks": false,
  "isAccountInformation": false,
  "isOrders": false
  "catalog": null | Array<{name: string, quantity: number, price: number}>;
}
IMPORTANTE: Quiero que únicamente me devuelvas el objeto JSON sin ningún texto adicional. 
Aquí está el mensaje que quiero que analices: "${messageToEvaluate}"`;
    try {
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return this.convertToJSON(text);
    } catch (error) {
      console.log(error);
      return {
        isWelcome: false,
        wantToBuy: false,
        isGivingThanks: false,
        isAccountInformation: false,
        isOrders: false,
        catalog: null,
      };
    }
  }

  convertToJSON(text: string): MessageEvaluated {
    const firstText = text.replace(/^```json\s*|\s*```$/g, "");
    const newText = firstText.replace(/`/g, "");
    return JSON.parse(newText);
  }

  convertProductsToJSON(text: string): Product[] {
    const firstText = text.replace(/^```json\s*|\s*```$/g, "");
    const newText = firstText.replace(/`/g, "");
    return JSON.parse(newText);
  }

  convertToJSONObject(text: string): CatalogJSON {
    const firstText = text.replace(/^```json\s*|\s*```$/g, "");
    const newText = firstText.replace(/`/g, "");
    return JSON.parse(newText);
  }

  async evaluateExtractedProducts(
    products: Array<{ name: string; quantity: number; price: null | number }>
  ) {
    const existingProducts = await this.product.findMany();

    const propmt = `Voy a darte un array de productos y quiero que me devuelvas
     **únicamente** un objeto JSON que indique lo que el 
     cliente quiere. este es el array de productos existentes: ${JSON.stringify(existingProducts)}
     , ahora quiero que me devuelvas un array json con los productos que el cliente quiere segun
      los productos existentes. Ejemplo: [{id: '12', name: "product_name", quantity: 1, price: 1}]
      IMPORTANTE: Quiero que únicamente me devuelvas el objeto JSON sin ningún texto adicional.
      Aquí está el array de productos que quiero que analices: ${JSON.stringify(products)}
     `;
    try {
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await this.model.generateContent(propmt);
      const response = await result.response;
      const text = response.text();
      return this.convertProductsToJSON(text);
    } catch (error) {
      console.log(error);
    }
  }

  async generateJSONProductsCatalog(
    products_no_image: {
      id: string;
      title: string;
      description: string;
      image: string;
    }[],
    products: {
      id: string;
      title: string;
      description: string;
      image: string;
    }[]
  ) {
    const catalog_heading = "${data.catalog_heading}";
    const productsArray = "${data.products}";
    const productsPayload = "${form.selected_products}";

    const prompt = `Voy a darte un prompt y quiero que me devuelvas **únicamente** un objeto JSON 
    que me ayude a remplazar el contenido de un objeto JSON con un array de productos en la base de dataSource
    este es el arreglo de productos de la base de datos ${JSON.stringify(products_no_image)} Y Este es un ejemplo de como debe ser el objeto JSON que debes devolver:
    {
    "version": "5.0",
    "screens": [
        {
            "id": "CATALOG",
            "title": "Catalogo",
            "terminal": true,
            "data": {
                "catalog_heading": {
                    "type": "string",
                    "__example__": "Colección de productos"
                },
                "products": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {
                                "type": "string"
                            },
                            "title": {
                                "type": "string"
                            },
                            "description": {
                                "type": "string"
                            },
                            "image": {}
                        }
                    },
                    "__example__": [
                        {
                            "id": "1",
                            "title": "Angular",
                            "description": "$499.00",
                            "image": "[image_base64]"
                        }
                    ]
                }
            },
            "layout": {
                "type": "SingleColumnLayout",
                "children": [
                    {
                        "type": "Form",
                        "name": "form",
                        "children": [
                            {
                                "type": "CheckboxGroup",
                                "name": "selected_products",
                                "label": "${catalog_heading}",
                                "required": true,
                                "data-source": "${productsArray}"
                            },
                            {
                                "type": "Footer",
                                "label": "Continue",
                                "on-click-action": {
                                    "name": "complete",
                                    "payload": {
                                        "products": "${productsPayload}"
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        }
    ]
}
    . Necesito que Me regreses Este Objeto json replazando el arreglo de productos que esta en __example__ por el arreglo de productos que te estoy enviando, 
    No olvides que no quiero que me regreses texto adicional. solo el objeto JSON.
    `;
    try {
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonGenerated = this.convertToJSONObject(text);
      for (
        let i = 0;
        i < jsonGenerated.screens[0].data.products.__example__.length;
        i++
      ) {
        jsonGenerated.screens[0].data.products.__example__[i] = products[i];
      }
      console.log(JSON.stringify(jsonGenerated));
      // return jsonGenerated;
    } catch (error) {
      console.log(error);
    }
  }

  async generateFeedbackMessage(feedback: string, client: string) {
    const prompt = `Voy a darte un mensaje de feedback del cliente y quiero que me devuelvas **unicamente la respuesta que podriamos darle al cliente**.
    Aqui esta el mensaje de feedback: "${feedback}"
    
    recalcarle que es importante que estamos al tanto de su opinion y que estamos trabajando para mejorar nuestros servicios. Puedes agregar al feedback el nombre
    del cliente para hacerlo mas personalizado. No olvides que la respuesta que me des debe de ser relacionada con el feedback del cliente.
    el nombre del cliente es : "${client}". Tambien puedes agregar algun mensaje de agradecimiento. y puedes utilizar emojis para hacerlo mas amigable. trata de no extenderte mucho en la respuesta.
    `;

    try {
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return text;
    } catch (error) {
      console.log(error);
    }
  }
}
