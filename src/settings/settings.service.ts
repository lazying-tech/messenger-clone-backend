import { HttpStatus, Injectable } from '@nestjs/common';
import { MSG } from 'src/message';
import { PrismaService } from 'src/prisma/prisma.service';

import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(private prismaService: PrismaService) {}

  async create(currentUserEmail: string, createSettingDto: any) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          email: currentUserEmail,
        },
      });
      const { name, image } = createSettingDto;

      if (!user) {
        return MSG('Unauthorized', null, null, HttpStatus.UNAUTHORIZED);
      }

      const updatedUser = await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          image: image,
          name: name,
        },
      });

      return MSG('DONE!!!', updatedUser, null, HttpStatus.OK);
    } catch (err: any) {
      return MSG(
        'Internal Error',
        null,
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findAll() {
    return `This action returns all settings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} setting`;
  }

  update(id: number, updateSettingDto: UpdateSettingDto) {
    return `This action updates a #${id} setting`;
  }

  remove(id: number) {
    return `This action removes a #${id} setting`;
  }
}
