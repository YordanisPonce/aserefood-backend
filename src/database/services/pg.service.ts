import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import User from '../entities/user.entity';
import RefreshToken from '../entities/refresh-token.entity';
import Permission from '../entities/permission.entity';
import Role from '../entities/role.entity';
import Municipality from '../entities/municipality.entity';
import Province from '../entities/province.entity';
import Zone from '../entities/zone.entity';
import Provider from '../entities/provider.entity';
import Category from '../entities/category.entity';
import Product from '../entities/product.entity';
import ConfirmationToken from '../entities/confirmation-token.entity';
import { InventoryEntry } from '../entities/inventory-entry.entity';
import ProductCombo from '../entities/product-combo.entity';
import ProductComboItem from '../entities/product-combo-item.entity';
import Department from '../entities/department.entity';
import { DeliveryMethod } from '../entities/delivery-method.entity';
import Promotion from '../entities/promotion.entity';
import Currency from '../entities/currency.entity';
import Language from '../entities/language.entity';
import ContactInfo from '../entities/contact-info.entity';
import ShoppingCart from '../entities/shopping-cart.entity';
import TransferPayment from '../entities/transferPayment.entity';
import OnlinePayment from '../entities/online-payment.entity';
import Order from '../entities/order.entity';

@Injectable()
export default class PgService {
  constructor(
    @InjectEntityManager() public readonly em: EntityManager,
    @InjectRepository(User) public readonly users: Repository<User>,
    @InjectRepository(RefreshToken) public readonly refreshTokens: Repository<RefreshToken>,
    @InjectRepository(Permission) public readonly permissions: Repository<Permission>,
    @InjectRepository(Role) public readonly roles: Repository<Role>,
    @InjectRepository(Municipality) public readonly municipalities: Repository<Municipality>,
    @InjectRepository(Province) public readonly provinces: Repository<Province>,
    @InjectRepository(Zone) public readonly zones: Repository<Zone>,
    @InjectRepository(Provider) public readonly providers: Repository<Provider>,
    @InjectRepository(Category) public readonly categories: Repository<Category>,
    @InjectRepository(Product) public readonly products: Repository<Product>,
    @InjectRepository(ConfirmationToken) public readonly confirmationTokens: Repository<ConfirmationToken>,
    @InjectRepository(InventoryEntry) public readonly inventoryEntries: Repository<InventoryEntry>,
    @InjectRepository(ProductCombo) public readonly productCombos: Repository<ProductCombo>,
    @InjectRepository(ProductComboItem) public readonly productComboItems: Repository<ProductComboItem>,
    @InjectRepository(Department) public readonly departments: Repository<Department>,
    @InjectRepository(DeliveryMethod) public readonly deliveryMethods: Repository<DeliveryMethod>,
    @InjectRepository(Promotion) public readonly promotions: Repository<Promotion>,
    @InjectRepository(Currency) public readonly currencies: Repository<Currency>,
    @InjectRepository(Language) public readonly languages: Repository<Language>,
    @InjectRepository(ContactInfo) public readonly contactInfos: Repository<ContactInfo>,
    @InjectRepository(ShoppingCart) public readonly shoppingCarts: Repository<ShoppingCart>,
    @InjectRepository(TransferPayment) public readonly transferPayments: Repository<TransferPayment>,
    @InjectRepository(OnlinePayment) public readonly onlinePayments: Repository<OnlinePayment>,
    @InjectRepository(Order) public readonly orders: Repository<Order>,
  ) {
  }
}