import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as guid } from 'uuid';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export default class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly uploadDirectory: string;
  private readonly appUrl: string;

  constructor(private readonly configService: ConfigService) {
    const uploadsPath = this.configService.get<string>('UPLOADS_PATH');
    this.uploadDirectory = uploadsPath
      ? path.resolve(uploadsPath)
      : path.resolve(process.cwd(), 'uploads');

    const rawAppUrl =
      this.configService.get<string>('APP_URL') ||
      `http://localhost:${this.configService.get<number>('APP_PORT')}`;
    this.appUrl = rawAppUrl.replace(/\/$/, '');
  }

  private async ensureUploadDirectory() {
    await fs.mkdir(this.uploadDirectory, { recursive: true });
  }

  async uploadFile(
    fileName: string = guid(),
    fileBuffer: Buffer,
    fileFormat?: string,
    mimeType?: string,
  ) {
    await this.ensureUploadDirectory();

    if (fileFormat && !fileName.endsWith(`.${fileFormat}`)) {
      fileName = fileName.concat(`.${fileFormat}`);
    }

    const targetPath = path.join(this.uploadDirectory, fileName);
    await fs.writeFile(targetPath, fileBuffer);

    this.logger.log(`Uploaded file ${fileName} with MIME type ${mimeType}`);
    return fileName;
  }

  async getFile(fileName: string) {
    const targetPath = path.join(this.uploadDirectory, fileName);
    return fs.readFile(targetPath);
  }

  async getPresignedUrl(objectName: string): Promise<string> {
    const url = `${this.appUrl}/files/${encodeURIComponent(objectName)}`;
    this.logger.log(`Resolved file URL for ${objectName}: ${url}`);
    return url;
  }

  async deleteFile(fileName: string) {
    const targetPath = path.join(this.uploadDirectory, fileName);
    try {
      await fs.unlink(targetPath);
      this.logger.log(`Deleted file ${fileName}`);
    } catch (error) {
      this.logger.error(`Could not delete file ${fileName}: ${error.message}`);
    }
  }

  isValidGuid(guid: string): boolean {
    const guidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return guidRegex.test(guid);
  }
}
