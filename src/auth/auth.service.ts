import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshDto,
} from './dto/auth.dto';
import * as crypto from 'crypto';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }

  private async getTokens(
    userId: string,
    email: string,
    organizationId: string,
  ) {
    const jwtPayload = {
      sub: userId,
      email: email,
      organizationId: organizationId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_EXPIRES_IN',
          '15m',
        ) as any,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN',
          '7d',
        ) as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hash = await this.hashData(refreshToken);
    await this.authRepository.updateUser({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    });
  }

  async signup(dto: SignupDto) {
    const existingUser = await this.authRepository.findUniqueUser({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await this.hashData(dto.password);

    // Create organization and user in a transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const org = await this.authRepository.createOrganization(
        {
          data: { name: dto.organizationName },
        },
        tx,
      );

      return this.authRepository.createUser(
        {
          data: {
            email: dto.email,
            passwordHash: hashedPassword,
            organizationId: org.id,
          },
        },
        tx,
      );
    });

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.organizationId,
    );
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async login(dto: LoginDto) {
    const user = await this.authRepository.findUniqueUser({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.organizationId,
    );
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async refreshTokens(dto: RefreshDto) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.authRepository.findUniqueUser({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Access Denied');
      }

      const refreshTokenMatches = await bcrypt.compare(
        dto.refreshToken,
        user.refreshTokenHash,
      );
      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Access Denied');
      }

      const tokens = await this.getTokens(
        user.id,
        user.email,
        user.organizationId,
      );
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (e) {
      throw new UnauthorizedException('Access Denied');
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.authRepository.findUniqueUser({
      where: { email: dto.email },
    });

    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return { message: 'If an account exists, a reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await this.hashData(resetToken);

    // Expires in 1 hour
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.authRepository.updateUser({
      where: { id: user.id },
      data: {
        resetTokenHash,
        resetTokenExpiresAt: expiresAt,
      },
    });

    // In a real app, send an email here with `resetToken`
    return {
      message: 'If an account exists, a reset link has been sent.',
      debugToken: resetToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.authRepository.findUniqueUser({
      where: { email: dto.email },
    });

    if (!user || !user.resetTokenHash || !user.resetTokenExpiresAt) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (new Date() > user.resetTokenExpiresAt) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const tokenMatches = await bcrypt.compare(dto.token, user.resetTokenHash);
    if (!tokenMatches) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const newPasswordHash = await this.hashData(dto.newPassword);

    await this.authRepository.updateUser({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    });

    return { message: 'Password has been successfully reset.' };
  }

  async getMe(userId: string) {
    const user = await this.authRepository.findUniqueUser({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        organizationId: true,
        createdAt: true,
        organization: {
          select: {
            name: true,
          },
        },
      },
    });
    return user;
  }
}
