import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import CategorySearchInDto from '../dto/in/category.search.in.dto';
import PaginatedOutDto from '../../utils/dto/out/paginated.out.dto';
import CategoryOutDto from '../dto/out/category.out.dto';
import CategoryInDto from '../dto/in/category.in.dto';
import Category from '../../database/entities/category.entity';
import createPatchFields from '../../utils/dto/patch-fields.util';

@Injectable()
export default class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly pgService: PgService) {}

  async search(
    dto: CategorySearchInDto,
  ): Promise<PaginatedOutDto<CategoryOutDto>> {
    const queryBuilder = this.pgService.categories
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.children', 'children');

    if (dto.search) {
      queryBuilder.where(
        'category.name ILIKE :search OR category.description ILIKE :search',
        {
          search: `%${dto.search}%`,
        },
      );
    }

    if (dto.parentId !== undefined && dto.parentId !== null) {
      queryBuilder.andWhere('category.parentId = :parentId', {
        parentId: dto.parentId,
      });
    }

    dto.isFlat ??= true;
    dto.isFlat = dto.isFlat.toString() == 'true'; // Boolean String Difficulties :(

    if (dto.isFlat.valueOf()) {
      queryBuilder.andWhere('category.parentId IS NULL');
    }

    // Ordering
    const orderBy = dto.orderBy || 'id';
    const orderDirection =
      dto.orderDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    queryBuilder.orderBy(`category.${orderBy}`, orderDirection);

    // Pagination
    const [result, total] = await queryBuilder
      .skip((dto.page - 1) * dto.pageSize)
      .take(dto.pageSize)
      .getManyAndCount();

    const categoriesOut = result.map((user) => this.toOutDto(user));

    return {
      data: categoriesOut,
      total,
      page: dto.page,
      pageSize: dto.pageSize,
      hasNextPage: dto.page * dto.pageSize < total,
      hasPreviousPage: dto.page > 1,
    };
  }

  async getById(id: number): Promise<CategoryOutDto> {
    const category = await this.pgService.categories.findOne({
      where: { id },
      relations: ['children'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return this.toOutDto(category);
  }

  async post(dto: CategoryInDto): Promise<CategoryOutDto> {
    const existingCategoryByName = await this.pgService.categories.findOne({
      where: { name: dto.name },
    });

    if (existingCategoryByName) {
      throw new ConflictException(
        `Category with name "${dto.name}" already exists`,
      );
    }

    const newCategory = this.pgService.categories.create({
      name: dto.name,
      description: dto.description,
      parentId: dto.parentId,
    });
    await this.pgService.categories.save(newCategory);

    this.logger.log(`Created new category with ID ${newCategory.id}`);

    return this.toOutDto(newCategory);
  }

  async patch(id: number, dto: CategoryInDto): Promise<void> {
    if (dto.name) {
      const category = await this.pgService.categories.findOne({
        where: { name: dto.name },
      });

      if (category && category.id !== id) {
        throw new ConflictException(
          `Category with name "${dto.name}" already exists`,
        );
      }
    }

    const category = await this.pgService.categories.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    let patchDto = createPatchFields(dto);

    await this.pgService.categories.update(id, patchDto);
    this.logger.log(`Updated category with ID ${id}`);
    this.logger.log({ ...patchDto });
  }

  async delete(id: number): Promise<void> {
    const categoryToDelete = await this.pgService.categories.findOne({
      where: { id },
      relations: ['products'],
    });

    if (
      categoryToDelete &&
      categoryToDelete.products &&
      categoryToDelete.products.length > 0
    ) {
      throw new ConflictException(
        `Category with ID ${id} has Associated Products`,
      );
    }

    const result = await this.pgService.categories.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.logger.log(`Deleted user with ID ${id}`);
  }

  private toOutDto(category: Category): CategoryOutDto {
    const dto = new CategoryOutDto();
    dto.id = category.id;
    dto.name = category.name;
    dto.description = category.description;
    dto.parentId = category.parentId;

    if (category.children && category.children.length > 0) {
      dto.children = category.children.map((child) => this.toOutDto(child));
    } else {
      dto.children = [];
    }

    return dto;
  }
  
}
