import { HttpStatus, Injectable } from '@nestjs/common';
import { MSG } from '../message';

import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async create(createAuthDto: CreateAuthDto) {
    const { email, password, name } = createAuthDto;
    if (!email || !password || !name) {
      return MSG('Missing Info', null, null, HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: { email, name, hashedPassword },
    });
    return user;
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
