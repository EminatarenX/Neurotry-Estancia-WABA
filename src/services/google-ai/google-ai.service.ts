import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';


@Injectable()
export class GoogleAiService {
    private genAI: GoogleGenerativeAI;
    public model: GenerativeModel;
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash"})
    }


    async generateText(prompt: string): Promise<string> {
        const { response } = await this.model.generateContent(prompt);
        const text = response.text();

        return text;

    }
}
