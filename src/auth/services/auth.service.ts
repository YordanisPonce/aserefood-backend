import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../decorators/roles.decorator';
import RegisterInDto from '../dto/in/register.in.dto';
import ResetPasswordInDto from '../dto/in/reset-password.in.dto';
import MailService from '../../mail/services/mail.service';
import CustomerOutDto from '../dto/out/customer.out.dto';

@Injectable()
export default class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly pgService: PgService,
    private readonly mailService: MailService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.pgService.users.findOne({
      where: { email, isActive: true, isConfirmed: true },
    });

    if (!user || !(await user.validatePassword(password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      username: user.username,
      email: user.email,
      name: user.name,
      userId: user.id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '30d' },
    );

    const rt = await this.pgService.refreshTokens.findOne({
      where: { userId: user.id },
    });

    if (!rt) {
      const newRT = this.pgService.refreshTokens.create({
        userId: user.id,
        refreshToken: refreshToken,
      });

      await this.pgService.refreshTokens.save(newRT);
      this.logger.log(`Created new refresh token for User ${user.id}`);
    } else {
      await this.pgService.refreshTokens.update(rt.id, {
        refreshToken: refreshToken,
      });
    }

    this.logger.log(`Authenticated User ${user.id}`);

    return { accessToken, refreshToken };
  }

  async refresh(oldRefreshToken: string) {
    try {
      const payload = this.jwtService.verify(oldRefreshToken);
      const userId = payload.sub;

      const rt = await this.pgService.refreshTokens.findOne({
        where: { userId },
      });

      if (!rt || rt.refreshToken !== oldRefreshToken) {
        throw new Error();
      }

      const user = await this.pgService.users.findOne({
        where: { id: rt.userId },
      });

      if (!user) {
        throw new Error();
      }

      const newPayload = {
        username: user.username,
        email: user.email,
        name: user.name,
        userId: user.id,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(newPayload);
      const refreshToken = this.jwtService.sign(
        { sub: user.id },
        { expiresIn: '30d' },
      );

      if (!rt) {
        const newRT = this.pgService.refreshTokens.create({
          userId: user.id,
          refreshToken: refreshToken,
        });

        await this.pgService.refreshTokens.save(newRT);
        this.logger.log(`Created new refresh token for User ${user.id}`);
      } else {
        await this.pgService.refreshTokens.update(rt.id, {
          refreshToken: refreshToken,
        });
      }

      this.logger.log(`Created new refresh token for User ${rt.userId}`);

      return { accessToken, refreshToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.pgService.users.findOne({
      where: { id: userId },
    });
    if (!user || !(await user.validatePassword(oldPassword))) {
      throw new BadRequestException('Invalid credentials');
    }

    user.password = newPassword;

    await this.pgService.users.save(user);

    this.logger.log(`Updated user Password with ID ${user.id}`);
  }

  async confirmAccount(confirmationToken: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(confirmationToken);
      const userId = payload.sub;

      const ct = await this.pgService.confirmationTokens.findOne({
        where: { userId },
      });

      if (!ct) {
        throw new Error();
      }

      await this.pgService.users.update(ct.userId, {
        isConfirmed: true,
      });

      await this.pgService.confirmationTokens.delete(ct.id);

      this.logger.log(`Confirmed Account of User ${ct.userId}`);
    } catch (error) {
      throw new UnauthorizedException('Invalid confirmation token');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.pgService.users.findOne({
      where: { email: email, isConfirmed: true, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('Account Not Found');
    }

    const resetPasswordToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '1d' },
    );

    await this.mailService.sendResetPasswordEmail(
      email,
      user.username,
      resetPasswordToken,
    );
  }

  async resetPassword(dto: ResetPasswordInDto): Promise<void> {
    try {
      const payload = this.jwtService.verify(dto.resetPasswordToken);
      const userId = payload.sub;

      const user = await this.pgService.users.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new Error();
      }

      user.password = dto.password;

      await this.pgService.users.save(user);

      this.logger.log(`Reset Password Successfully for User ${userId}`);
    } catch (error) {
      throw new UnauthorizedException('Invalid Reset Password Token');
    }
  }

  async register(dto: RegisterInDto): Promise<CustomerOutDto> {
    const existingUserUsername = await this.pgService.users.findOne({
      where: { username: dto.username },
    });
    if (existingUserUsername) {
      throw new ConflictException(
        `User with username "${dto.username}" already exists`,
      );
    }

    const existingUserEmail = await this.pgService.users.findOne({
      where: { email: dto.email },
    });
    if (existingUserEmail) {
      throw new ConflictException(
        `User with email "${dto.email}" already exists`,
      );
    }

    const newUser = this.pgService.users.create({
      username: dto.username,
      email: dto.email,
      password: dto.password,
      role: Role.Customer,
      name: dto.name,
      isActive: true,
      isConfirmed: false,
      lastnames: dto.lastnames,
      phoneNumber: dto.phoneNumber,
    });

    await this.pgService.users.save(newUser);
    this.logger.log(`Created new user with ID ${newUser.id}`);

    const confirmationToken = this.jwtService.sign(
      { sub: newUser.id },
      { expiresIn: '300d' },
    );

    const newCt = this.pgService.confirmationTokens.create({
      userId: newUser.id,
      confirmationToken,
    });

    await this.pgService.confirmationTokens.save(newCt);
    this.logger.log(`Created new confirmation token for User ${newUser.id}`);

    await this.mailService.sendConfirmAccountEmail(
      newUser.email,
      newUser.username,
      confirmationToken,
    );

    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      isActive: newUser.isActive,
      isConfirmed: newUser.isConfirmed,
      phoneNumber: newUser.phoneNumber,
      lastNames: newUser.lastnames,
    };
  }
}
