import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateReunioesDto } from './dto/create-reunioes.dto';
import { UpdateReunioesDto } from './dto/update-reunioes.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
// import { Connection } from 'oracledb';

@Injectable()
export class ReunioesService {
  constructor(
    private prisma: PrismaService,
    private app: AppService
  ) { }

  async listaCompleta() {
    const lista = await this.prisma.reuniao_Processo.findMany({
      orderBy: { data_reuniao: 'asc' }
    });
    if (!lista || lista.length == 0) throw new ForbiddenException('Nenhuma subprefeitura encontrada');
    return lista;
  }

  async buscarPorMesAno(mes: number, ano: number) {
    const primeiroDiaMes = new Date(ano, mes - 1, 1);
    const ultimoDiaMes = new Date(ano, mes, 0);

    const reunioes = await this.prisma.reuniao_Processo.findMany({
      where: {
        AND: [
          { data_reuniao: { gte: primeiroDiaMes } },
          { data_reuniao: { lte: ultimoDiaMes } }
        ]
      }
    });

    if (!reunioes || reunioes.length === 0) {
      throw new ForbiddenException('Nenhuma reunião encontrada para o mês/ano especificado.');
    }

    return reunioes;
  }

  async buscarPorId(idInt: string) {
    var id = parseInt(idInt.toString());
    const inicial = await this.prisma.inicial.findUnique({ where: { id } });
    if (!inicial) throw new ForbiddenException('Inicial não encontrada.');
    return inicial;
  }

  async atualizarData(id: string, updateReunioesDto: UpdateReunioesDto) {
    updateReunioesDto.nova_data_reuniao = new Date(updateReunioesDto.nova_data_reuniao);
    updateReunioesDto.nova_data_reuniao.setUTCHours(updateReunioesDto.nova_data_reuniao.getUTCHours() - 3);
    const reuniao = await this.prisma.reuniao_Processo.update({
      where: { id },
      data: {
        nova_data_reuniao: updateReunioesDto.nova_data_reuniao,
        justificativa_remarcacao: updateReunioesDto.justificativa_remarcacao
      }
    });
    return reuniao;
  }

  async buscarPorData(data: Date) {
    const reuniao = await this.prisma.reuniao_Processo.findMany({
      where: {
          data_reuniao: {
            equals: new Date(data).toISOString()
          }
      },
      include: {
        inicial: true
      }
    });
    if (!reuniao) {
      throw new ForbiddenException('Nenhuma reunião encontrada para a data especificada.');
    } 
    return reuniao;
  }


}
