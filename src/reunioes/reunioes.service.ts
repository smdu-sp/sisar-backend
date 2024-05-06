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




  // async buscarPorMes_ano(mes_ano: Date) {
  //   const reuniao = await this.prisma.reuniao_Processo.findMany({ where: { data_reuniao: mes_ano } });
  //   if (!reuniao || reuniao.length == 0) throw new ForbiddenException('Nenhuma subprefeitura encontrada');
  //   return reuniao;
  // }

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

  async buscarPorId(id: string) {
    const reuniao = await this.prisma.reuniao_Processo.findUnique({ where: { id } });
    if (!reuniao) throw new ForbiddenException('subprefeitura não encontrada.');
    return reuniao;
  }

  async buscarPorData(data: Date) {
    console.log(data);
    
    const reuniao = await this.prisma.reuniao_Processo.findMany({
      where: {
        data_reuniao: {
          equals: new Date(data).toISOString()
        }
      }
    });

    if (!reuniao) {
      throw new ForbiddenException('Nenhuma reunião encontrada para a data especificada.');
    } 

    return reuniao;
  }



}
