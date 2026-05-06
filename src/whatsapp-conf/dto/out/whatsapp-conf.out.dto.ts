// src/modules/whatsapp-conf/dto/out/whatsapp-conf.out.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export default class WhatsAppConfOutDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  phoneNumber: string;
}