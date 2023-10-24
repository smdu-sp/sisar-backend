import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateAlvaraTipoDto } from './dto/create-alvara_tipo.dto';
import { UpdateAlvaraTipoDto } from './dto/update-alvara_tipo.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Alvara_Tipo } from '@prisma/client';

@Injectable()
export class AlvaraTipoService {
  constructor (private prisma: PrismaService) {}

  async verificaSeExiste(nome: string, id?: string) {
    const alvara_tipo = await this.prisma.alvara_Tipo.findFirst({ where: { nome } });
    if (id)
      if (alvara_tipo && alvara_tipo.id != id) throw new ForbiddenException('Tipo de alvará já cadastrado');
    if (alvara_tipo) throw new ForbiddenException('Tipo de alvará já cadastrado');
  }

  async create(createAlvaraTipoDto: CreateAlvaraTipoDto): Promise<Alvara_Tipo> {
    await this.verificaSeExiste(createAlvaraTipoDto.nome);
    const novo_alvara_tipo = await this.prisma.alvara_Tipo.create({ data: { ... createAlvaraTipoDto }});
    if (!novo_alvara_tipo) throw new ForbiddenException('Erro ao criar tipo de alvará');
    return novo_alvara_tipo;
  }

  async findAll(): Promise<Alvara_Tipo[]> {
    const alvara_tipos = await this.prisma.alvara_Tipo.findMany({});
    if (!alvara_tipos) throw new ForbiddenException('Nenhum tipo de alvará encontrado');
    return alvara_tipos;
  }

  async findOne(id: string): Promise<Alvara_Tipo> {
    const alvara_tipo = await this.prisma.alvara_Tipo.findFirst({ where: { id } });
    if (!alvara_tipo) throw new ForbiddenException('Tipo de alvará não encontrado');
    return alvara_tipo;
  }

  async update(id: string, updateAlvaraTipoDto: UpdateAlvaraTipoDto) {
    const alvara_tipo = await this.prisma.alvara_Tipo.findFirst({ where: { id } });
    if (!alvara_tipo) throw new ForbiddenException('Tipo de alvará não encontrado');
    await this.verificaSeExiste(updateAlvaraTipoDto.nome, id);
    const alvara_tipo_atualizado = await this.prisma.alvara_Tipo.update({ where: { id }, data: { ... updateAlvaraTipoDto } });
    if (!alvara_tipo_atualizado) throw new ForbiddenException('Erro ao atualizar tipo de alvará');
    return alvara_tipo_atualizado;
  }

  // remove(id: number) {
  //   return `This action removes a #${id} alvaraTipo`;
  // }
}
