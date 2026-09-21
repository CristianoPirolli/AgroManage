import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { AuthenticatedUser } from './auth.types.js';

const BCRYPT_COST = 12;
// Hash de um valor fixo, usado só pra manter o tempo de resposta do login
// constante quando o e-mail não existe (evita descobrir e-mails cadastrados
// pelo tempo de resposta, já que bcrypt.compare só roda quando o usuário existe).
const DUMMY_PASSWORD_HASH = '$2b$12$owIAXvn8IK3SgYqcChSkRe0VGGht.y/P2txHVsnJH7ybG3UTb5gSe';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await hash(dto.password, BCRYPT_COST);

    try {
      const user = await this.prisma.user.create({
        data: { name: dto.name, email: dto.email, passwordHash },
        select: { id: true, name: true, email: true },
      });
      return this.issueToken(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('E-mail já cadastrado');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    const isValidPassword = await compare(dto.password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);

    if (!user || !isValidPassword) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    return this.issueToken({ id: user.id, name: user.name, email: user.email });
  }

  private async issueToken(user: AuthenticatedUser) {
    const accessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email });
    return { accessToken, user };
  }
}
