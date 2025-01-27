import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { UpdateAvisoDto } from './dto/update-aviso.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AvisosResponseDTO } from './dto/response.dto';
import { Avisos } from '@prisma/client';

@Injectable()
export class AvisosService {
  constructor(private prisma: PrismaService) {}

  async create(createAvisoDto: CreateAvisoDto, usuario_id?: string): Promise<AvisosResponseDTO> {
    let { titulo, descricao, data, inicial_id } = createAvisoDto;
    const criar: Avisos = await this.prisma.avisos.create({
      data: { titulo, descricao, data, usuario_id, inicial_id }
    });
    if (!criar) 
      throw new InternalServerErrorException('Não foi possível criar o aviso. Tente novamente.');
    return criar;
  }

  async findOne(data: Date, usuario_id: string) {
    if (data instanceof Date) data.setHours(0, 0, 0, 0);
    const reuniao_data = new Date(data).toISOString();
    const reunioes = await this.prisma.avisos.findMany({
      include: {
        inicial: true
      },
      where: {
        AND: [
          {
            OR: [
              { usuario_id: { equals: usuario_id } },
              { usuario_id: { equals: null } }
            ]
          },
          { data: { equals: reuniao_data } }
        ]
      }
    });
    if (!reunioes) 
      throw new InternalServerErrorException('Nenhuma reunião encontrada para a data especificada.');
    return reunioes;
  }

  async buscarPorMesAno(mes: number, ano: number, usuario_id: string): Promise<Avisos[]> {
    const primeiroDiaMes: Date = new Date(ano, mes - 1, 1);
    const ultimoDiaMes: Date = new Date(ano, mes, 0);
    const avisos: Avisos[] = await this.prisma.avisos.findMany({
      where: {
        AND: [
          {
            OR: [
              { usuario_id: { equals: usuario_id } },
              { usuario_id: { equals: null } }
            ]
          },
          { data: { gte: primeiroDiaMes } },
          { data: { lte: ultimoDiaMes } }
        ]
      }
    });
    if (!avisos || avisos.length === 0)
      throw new InternalServerErrorException('Nenhuma reunião encontrada para o mês/ano especificado.');
    return avisos;
  }

  async update(id: string, updateAvisoDto: UpdateAvisoDto): Promise<AvisosResponseDTO> {
    const atualizar: Avisos = await this.prisma.avisos.update({
      where: { id },
      data: updateAvisoDto
    });
    return atualizar;
  }

  async remove(id: string): Promise<AvisosResponseDTO> {
    const deletar: Avisos = await this.prisma.avisos.delete({
      where: { id }
    });
    return deletar;
  }
}
