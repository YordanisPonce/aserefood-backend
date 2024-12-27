import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import ZelleConfOutDto from '../dto/out/zelle-conf.out.dto';
import ZelleConfInDto from '../dto/in/zelle-conf.in.dto';

@Injectable()
export default class ZelleConfService {
  private readonly logger = new Logger(ZelleConfService.name);

  constructor(private readonly pgService: PgService) {}

  async get(): Promise<ZelleConfOutDto> {
    const zelleList = await this.pgService.zelleConfs.find({ take: 1 });

    if (zelleList.length === 0) {
      throw new NotFoundException('Zelle Configuration not set yet');
    }

    const zelle = zelleList[0];
    return {
      phoneNumber: zelle.phoneNumber,
      qr: zelle.qr,
    };
  }

  async put(dto: ZelleConfInDto): Promise<ZelleConfOutDto> {
    const zelleList = await this.pgService.zelleConfs.find({ take: 1 });
    let zelle = zelleList[0];

    if(!zelle){
      zelle = this.pgService.zelleConfs.create(dto);
    }
    else{
      zelle.phoneNumber = dto.phoneNumber;
      zelle.qr = dto.qr;
    }

    await this.pgService.zelleConfs.save(zelle);
    return {
      phoneNumber: zelle.phoneNumber,
      qr: zelle.qr,
    }
  }
}