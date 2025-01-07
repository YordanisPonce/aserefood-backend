import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import ZelleConfOutDto from '../dto/out/zelle-conf.out.dto';
import ZelleConfInDto from '../dto/in/zelle-conf.in.dto';
import MinioService from '../../minio/services/minio.service';

@Injectable()
export default class ZelleConfService {
  private readonly logger = new Logger(ZelleConfService.name);

  constructor(
    private readonly pgService: PgService,
    private readonly minioService: MinioService,
  ) {}

  async get(): Promise<ZelleConfOutDto> {
    const zelleList = await this.pgService.zelleConfs.find({ take: 1 });

    if (zelleList.length === 0) {
      throw new NotFoundException('Zelle Configuration not set yet');
    }

    const zelle = zelleList[0];
    const qrUrl = await this.minioService.getPresignedUrl(zelle.qr);
    return {
      phoneNumber: zelle.phoneNumber,
      qr: qrUrl,
    };
  }

  async put(dto: ZelleConfInDto): Promise<ZelleConfOutDto> {
    const zelleList = await this.pgService.zelleConfs.find({ take: 1 });
    let zelle = zelleList[0];

    const fileExtension = dto.qr.originalname.split('.').pop();
    const mimeType = dto.qr.mimetype;

    if (!zelle) {
      const qrName = await this.minioService.uploadFile('1', dto.qr.buffer, fileExtension, mimeType);
      zelle = this.pgService.zelleConfs.create({
        phoneNumber: dto.phoneNumber,
        qr: qrName,
      });
    } else {
      const qrName = await this.minioService.uploadFile(zelle.qr, dto.qr.buffer, undefined, mimeType);
      zelle.phoneNumber = dto.phoneNumber;
      zelle.qr = qrName;
    }

    await this.pgService.zelleConfs.save(zelle);
    return {
      phoneNumber: zelle.phoneNumber,
      qr: zelle.qr,
    }
  }
}