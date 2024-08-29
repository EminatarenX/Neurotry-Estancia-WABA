import { Injectable } from "@nestjs/common";
import { OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { CreateProductDto } from "./dtos/create-product.dto";
import { CloudinaryService } from "src/services/cloudinary/cloudinary.service";
import { Readable } from "stream";
import * as sharp from "sharp";

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  constructor(private readonly cloudinaryService: CloudinaryService) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }
  async create(createProductDto: CreateProductDto, file: Express.Multer.File) {
    const processedImageBuffer = await sharp(file.buffer)
      .jpeg({ quality: 80 })
      .resize(null, 300)
      .toBuffer();
    
    const imageBase64 = processedImageBuffer.toString("base64");

    return this.product.create({
      data: {
        ...createProductDto,
        image: imageBase64,
      },
    });
  }

  async findAllProducts() {
    return this.product.findMany();
  }

  purgeProducts() {
    return this.product.deleteMany();
  }

  deleteProduct(id: string) {
    return this.product.delete({
      where: {
        id,
      },
    });
  }
}
