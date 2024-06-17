import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { UpdateAvisoDto } from './dto/update-aviso.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
@Injectable()
export class AvisosService {

  constructor(
    private prisma: PrismaService,
    private app: AppService
  ) {}

  
  async create(createAvisoDto: CreateAvisoDto) {
    let { titulo, descricao, data } = createAvisoDto;
    if (data instanceof Date) {
      data.setHours(0, 0, 0, 0);
    }
    const criar = await this.prisma.avisos.create({
      data: { titulo, descricao, data }
    });
    if (!criar) {
      throw new InternalServerErrorException('Não foi possível criar o aviso. Tente novamente.');
    }
    return criar;
  }
  

  async findOne(data: Date) {
    if (data instanceof Date) {
      data.setHours(0, 0, 0, 0);
    }
    const reuniao_data = new Date(data).toISOString();
    const reunioes = await this.prisma.avisos.findMany({
      where: {
        OR: [
          { data: { equals: reuniao_data } }
        ]
      }
    });
    if (!reunioes) {
      throw new InternalServerErrorException('Nenhuma reunião encontrada para a data especificada.');
    }
    return reunioes;
  }
  
  async buscarPorMesAno(mes: number, ano: number) {
    const primeiroDiaMes = new Date(ano, mes - 1, 1);
    const ultimoDiaMes = new Date(ano, mes, 0);

    const avisos = await this.prisma.avisos.findMany({
      where: {
        AND: [
          { data: { gte: primeiroDiaMes } },
          { data: { lte: ultimoDiaMes } }
        ]
      }
    });

    if (!avisos || avisos.length === 0) {
      throw new InternalServerErrorException('Nenhuma reunião encontrada para o mês/ano especificado.');
    }
    return avisos;
  }

  async update(id: string, updateAvisoDto: UpdateAvisoDto) {
    const atualizar = await this.prisma.avisos.update({
      where: { id },
      data: updateAvisoDto
    });
    return atualizar;
  }

  async remove(id: string) {
    const deletar = await this.prisma.avisos.delete({
      where: { id }
    });
    return deletar;
  }
}
