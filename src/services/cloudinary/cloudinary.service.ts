import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');
import { Readable } from 'stream';
@Injectable()

export class CloudinaryService {
  async uploadImage(
    imageStream: Readable, // Cambiado a Readable
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    
      imageStream.pipe(upload); // Ya no necesitas toStream
    });
  }
  // async uploadImage(
  //   file: Express.Multer.File,
  // ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    
  //   return new Promise((resolve, reject) => {
  //     const upload = v2.uploader.upload_stream((error, result) => {
  //       if (error) return reject(error);
  //       resolve(result);
  //     });
    
  //     toStream(file.buffer).pipe(upload);
  //   });
  // }
}