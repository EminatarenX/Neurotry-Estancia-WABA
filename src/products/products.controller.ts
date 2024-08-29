import { Body, Controller, Delete, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  createProduct( @Body() createProductDto: CreateProductDto, @UploadedFile() file: Express.Multer.File) {
    return this.productsService.create(createProductDto, file);
  }
  
  @Get()
  findAllProducts(){
    return this.productsService.findAllProducts()
  }

  @Get('purge')
  async purgeProducts(){
    return this.productsService.purgeProducts()
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string){
    return this.productsService.deleteProduct(id)
  }
}
