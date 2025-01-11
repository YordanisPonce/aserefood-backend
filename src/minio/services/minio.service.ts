import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Client } from 'minio';
import { v4 as guid } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class MinioService {
  private minioClient: Client;
  private bucketName: string;
  private readonly logger = new Logger(MinioService.name);

  constructor(
    private readonly configService: ConfigService
  ) {
    this.minioClient = new Client({
      endPoint: this.configService.get('MINIO_ENDPOINT'),
      port: Number(this.configService.get('MINIO_PORT')),
      useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get('MINIO_SECRET_KEY')
    })
    this.bucketName = this.configService.get('MINIO_BUCKET_NAME')
  }

  async uploadFile(
    fileName: string = guid(),
    fileBuffer: Buffer,
    fileFormat?: string,
    mimeType?: string,
  ) {
    if (fileFormat) {
      fileName = fileName.concat(`.${fileFormat}`);
    }

    const metaData = {
      'Content-Type': mimeType || 'application/octet-stream',
    };

    await this.minioClient.putObject(this.bucketName, fileName, fileBuffer, undefined, metaData);

    this.logger.log(`Uploaded file ${fileName} with MIME type ${mimeType}`);
    return fileName;
  }


  async getFile(fileName: string) {
    return await this.minioClient.getObject(this.bucketName, fileName);
  }

  async getPresignedUrl(
    objectName: string,
  ): Promise<string> {
    try {
      const expiryTime = 10 * 60;
      return await this.minioClient.presignedGetObject(
        this.bucketName,
        objectName,
        expiryTime,
      );
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async deleteFile(fileName: string) {
    this.logger.log(`Deleted file ${fileName}`);
    await this.minioClient.removeObject(this.bucketName, fileName);
  }

  isValidGuid(guid: string): boolean {
    const guidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return guidRegex.test(guid);
  }
}
