import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import ProvidersService from '../../providers/services/providers.service';
import PgService from '../../database/services/pg.service';
import Product from '../../database/entities/product.entity';
import ProductOutDto from '../../products/dto/out/product.out.dto';
import { InventoryEntry } from '../../database/entities/inventory-entry.entity';
import InventoryEntryOutDto from '../dto/out/inventory-entry.out.dto';
import CategoryInDto from '../../categories/dto/in/category.in.dto';
import createPatchFields from '../../utils/dto/patch-fields.util';
import InventoryEntryUpdateInDto from '../dto/in/inventory-entry.update.in.dto';
import ProductInDto from '../../products/dto/in/product.in.dto';
import { In } from 'typeorm';
import InventoryEntryInDto from '../dto/in/inventory-entry.in.dto';
import CategoryOutDto from '../../categories/dto/out/category.out.dto';
import ProductSearchInDto from '../../products/dto/in/product.search.in.dto';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import InventoryEntrySearchInDto from '../dto/in/inventory-entry.search.in.dto';

@Injectable()
export default class InventoryEntriesService {
  private readonly logger = new Logger(InventoryEntriesService.name);

  constructor(private readonly pgService: PgService) {}

  async search(
    dto: InventoryEntrySearchInDto,
  ): Promise<PaginatedOutDto<InventoryEntryOutDto>> {
    const queryBuilder = this.pgService.inventoryEntries
      .createQueryBuilder('inventory-entry')
      .leftJoinAndSelect('inventory-entry.product', 'product')
      .leftJoinAndSelect('inventory-entry.zone', 'zone');

    // Filtering
    if (dto.productId) {
      queryBuilder.where('inventory-entry.productId = :productId', {
        productId: dto.productId,
      });
    }

    if (dto.zoneId) {
      queryBuilder.andWhere('inventory-entry.zoneId = :zoneId', {
        zoneId: dto.zoneId,
      });
    }

    // Ordering
    const orderBy = dto.orderBy || 'id';
    const orderDirection =
      dto.orderDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    queryBuilder.orderBy(`inventory-entry.${orderBy}`, orderDirection);

    // Pagination
    const [result, total] = await queryBuilder
      .skip((dto.page - 1) * dto.pageSize)
      .take(dto.pageSize)
      .getManyAndCount();

    return {
      data: result.map((m) => this.toOutDto(m)),
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      hasNextPage: dto.page * dto.pageSize < total,
      hasPreviousPage: dto.page > 1,
    };
  }

  async getById(id: number): Promise<InventoryEntryOutDto> {
    const inventoryEntry = await this.pgService.inventoryEntries.findOne({
      where: { id },
      relations: ['product', 'zone'],
    });
    if (!inventoryEntry) {
      throw new NotFoundException(`Inventory Entry with ID ${id} not found`);
    }
    return this.toOutDto(inventoryEntry);
  }

  async post(dtoBulk: InventoryEntryInDto[]): Promise<InventoryEntryInDto[]> {
    if (dtoBulk.length === 0) {
      throw new BadRequestException(
        'Inventory Entries List must have at least 1 element',
      );
    }

    const inventoryEntries: InventoryEntryOutDto[] = [];
    for (const dto of dtoBulk) {
      const existingInventoryEntry = await this.pgService.inventoryEntries.findOne({
        where: { productId: dto.productId, zoneId: dto.zoneId },
      });

      if (existingInventoryEntry) {
        await this.patch(existingInventoryEntry.id, {price: dto.price, quantity: dto.quantity});
      }
      else{
        const product = await this.pgService.products.findOne({
          where: { id: dto.productId },
        });

        if(!product){
          throw new NotFoundException(`Product with id "${dto.productId}" not found.`);
        }

        const zone = await this.pgService.zones.findOne({
          where: { id: dto.zoneId },
        })

        if(!zone){
          throw new NotFoundException(`Zone with id "${dto.zoneId}" not found`);
        }

        const newInventoryEntry = this.pgService.inventoryEntries.create({
          zoneId: dto.zoneId,
          productId: dto.productId,
          quantity: dto.quantity,
          price: dto.price,
        });
        await this.pgService.inventoryEntries.save(newInventoryEntry);

        this.logger.log(`Created new inventory entry with ID ${newInventoryEntry.id}`);

        inventoryEntries.push(this.toOutDto(newInventoryEntry));
      }
    }

    return inventoryEntries;
  }

  async patch(id: number, dto: InventoryEntryUpdateInDto): Promise<void> {
    const inventoryEntry = await this.pgService.inventoryEntries.findOne({
      where: { id },
    });

    if (!inventoryEntry) {
      throw new NotFoundException(`Inventory Entry with ID ${id} not found`);
    }

    let patchDto = createPatchFields(dto);

    await this.pgService.inventoryEntries.update(id, patchDto);
    this.logger.log(`Updated inventory entry with ID ${id}`);
    this.logger.log({ ...patchDto });
  }

  async delete(id: number): Promise<void> {
    const result = await this.pgService.inventoryEntries.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Inventory Entry with ID ${id} not found`);
    }
    this.logger.log(`Deleted Inventory Entry with ID ${id}`);
  }

  private toOutDto(inventoryEntry: InventoryEntry): InventoryEntryOutDto {
    const dto = new InventoryEntryOutDto();
    dto.id = inventoryEntry.id;
    dto.productId = inventoryEntry.productId;
    dto.productName = inventoryEntry.product?.name ?? '';
    dto.zoneId = inventoryEntry.zoneId;
    dto.zoneName = inventoryEntry.zone?.name ?? '';
    dto.price = parseFloat(inventoryEntry.price.toString());
    dto.quantity = inventoryEntry.quantity;

    return dto;
  }
}
