// src/modules/whatsapp-conf/services/whatsapp-conf.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import WhatsAppConfOutDto from '../dto/out/whatsapp-conf.out.dto';
import WhatsAppConfInDto from '../dto/in/whatsapp-conf.in.dto';

@Injectable()
export default class WhatsAppConfService {
  private readonly logger = new Logger(WhatsAppConfService.name);

  constructor(
    private readonly pgService: PgService,
  ) {}

  async get(): Promise<WhatsAppConfOutDto> {
    const whatsappList = await this.pgService.whatsappConfs.find({ take: 1 });

    if (whatsappList.length === 0) {
      throw new NotFoundException('WhatsApp Configuration not set yet');
    }

    const whatsapp = whatsappList[0];
    return {
      id: whatsapp.id,
      phoneNumber: whatsapp.phoneNumber,
    };
  }

  async put(dto: WhatsAppConfInDto): Promise<WhatsAppConfOutDto> {
    const whatsappList = await this.pgService.whatsappConfs.find({ take: 1 });
    let whatsapp = whatsappList[0];

    if (!whatsapp) {
      // Crear nuevo registro
      whatsapp = this.pgService.whatsappConfs.create({
        phoneNumber: dto.phoneNumber,
      });
    } else {
      // Actualizar existente
      whatsapp.phoneNumber = dto.phoneNumber;
    }

    await this.pgService.whatsappConfs.save(whatsapp);
    
    return {
      id: whatsapp.id,
      phoneNumber: whatsapp.phoneNumber,
    };
  }
}