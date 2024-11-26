import PgService from '../../database/services/pg.service';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../auth/decorators/roles.decorator';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class AdminSeederService {
  constructor(
    private readonly pgService: PgService,
    private readonly configService: ConfigService,
  ) {}

  async createAdminUser(): Promise<void> {
    const adminEmail = this.configService.get('SEED_ADMIN_EMAIL');
    const adminPassword = this.configService.get('SEED_ADMIN_PASSWORD');

    const existingUser = await this.pgService.users.findOne({
      where: { email: adminEmail },
    });

    if (!existingUser) {
      const adminUser = this.pgService.users.create({
        name: 'Admin',
        lastnames: 'Admin',
        username: 'admin',
        email: adminEmail,
        phoneNumber: '1234567890',
        password: adminPassword,
        role: Role.Admin,
        isActive: true,
        isConfirmed: true,
      });

      await this.pgService.users.save(adminUser);
      console.log('Admin User Created:', adminUser);
    }
  }
}
