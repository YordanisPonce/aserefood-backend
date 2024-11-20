import { Controller, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('v1/products')
@ApiTags('products')
@UseInterceptors(CacheInterceptor)
export default class V1ProductsController {

}