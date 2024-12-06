import { ForbiddenException, Injectable } from '@nestjs/common';
import { UpdateReunioesDto } from './dto/update-reunioes.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Inicial, Reuniao_Processo } from '@prisma/client';

@Injectable()
export class ReunioesService {
  constructor(private prisma: PrismaService) {}

  async listaCompleta(): Promise<Reuniao_Processo[]> {
    const lista: Reuniao_Processo[] = await this.prisma.reuniao_Processo.findMany({
      orderBy: { data_reuniao: 'asc' }
    });
    if (!lista || lista.length == 0) 
      throw new ForbiddenException('Nenhuma subprefeitura encontrada');
    return lista;
  }

  async buscarPorMesAno(mes: number, ano: number): Promise<Reuniao_Processo[]> {
    const primeiroDiaMes: Date = new Date(ano, mes - 1, 1);
    const ultimoDiaMes: Date = new Date(ano, mes, 0);
    const reunioes: Reuniao_Processo[] = await this.prisma.reuniao_Processo.findMany({
      where: {
        OR: [
          { AND: [
              { nova_data_reuniao: { gte: primeiroDiaMes } }, 
              { nova_data_reuniao: { lte: ultimoDiaMes } }
            ] 
          },
          { 
            AND: [
              { nova_data_reuniao: null }, { data_reuniao: { gte: primeiroDiaMes } }, 
              { nova_data_reuniao: null }, { data_reuniao: { lte: ultimoDiaMes } }
            ] 
          }
        ]
      }
    });
    if (!reunioes || reunioes.length === 0)
      throw new ForbiddenException('Nenhuma reunião encontrada para o mês/ano especificado.');
    return reunioes;
  }

  async buscarPorId(idInt: string): Promise<Inicial> {
    let id: number = parseInt(idInt.toString());
    const inicial: Inicial = await this.prisma.inicial.findUnique({ where: { id } });
    if (!inicial) throw new ForbiddenException('Inicial não encontrada.');
    return inicial;
  }

  async atualizarData(id: string, updateReunioesDto: UpdateReunioesDto): Promise<Reuniao_Processo> {
    updateReunioesDto.nova_data_reuniao = new Date(updateReunioesDto.nova_data_reuniao);
    updateReunioesDto.nova_data_reuniao.setUTCHours(updateReunioesDto.nova_data_reuniao.getUTCHours() - 3);
    const reuniao: Reuniao_Processo = await this.prisma.reuniao_Processo.update({
      where: { id },
      data: {
        nova_data_reuniao: updateReunioesDto.nova_data_reuniao,
        justificativa_remarcacao: updateReunioesDto.justificativa_remarcacao
      }
    });
    return reuniao;
  }

  async buscarPorData(data: Date): Promise<Reuniao_Processo[]> {
    const reuniao_data: string = new Date(data).toISOString();
    const reunioes: Reuniao_Processo[] = await this.prisma.reuniao_Processo.findMany({
      where: {
        OR: [
          { nova_data_reuniao: { equals: reuniao_data } },
          { nova_data_reuniao: null, data_reuniao: { equals: reuniao_data } }
        ]
      },
      include: {
        inicial: true
      }
    });
    if (!reunioes)
      throw new ForbiddenException('Nenhuma reunião encontrada para a data especificada.');
    return reunioes;
  }
}
