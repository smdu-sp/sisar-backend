import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAdmissibilidadeDto } from './dto/create-admissibilidade.dto';
import { UpdateAdmissibilidadeDto } from './dto/update-admissibilidade.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { Admissibilidade, Interface } from '@prisma/client';
import { equal } from 'assert';
import { equals } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AdmissibilidadePaginado, AdmissibilidadeResponseDTO, CreateResponseAdmissibilidadeDTO } from './dto/responses.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

interface DiasUteis {
  diasUteis: [],
  dataExpiracao: String
}

@Injectable()
export class AdmissibilidadeService {
  constructor(
    private prisma: PrismaService,
    private app: AppService
  ) { }

  async create(
    createAdmissibilidadeDto: CreateAdmissibilidadeDto
  ): Promise<CreateResponseAdmissibilidadeDTO> {
    const { interfaces, tipo_processo, inicial_id } = createAdmissibilidadeDto;
    const admissibilidade: Admissibilidade = await this.prisma.admissibilidade.create({
      data: createAdmissibilidadeDto,
      include: { inicial: true }
    });
    if (tipo_processo) {
      await this.prisma.inicial.update({
        where: { id: inicial_id },
        data: { tipo_processo }
      });
    };
    if (tipo_processo === 2 && interfaces) {
      const interface_nova = this.prisma.interface.upsert({
        where: { inicial_id },
        create: {
          inicial_id,
          ...interfaces
        },
        update: {
          ...interfaces
        }
      });
    }
    if (!admissibilidade)
      throw new InternalServerErrorException('Não foi possível criar a subprefeitura. Tente novamente.');
    return admissibilidade;
  }

  async listaCompleta(): Promise<AdmissibilidadeResponseDTO[]> {
    const admissibilidade: AdmissibilidadeResponseDTO[] = await this.prisma.admissibilidade.findMany({
    });
    if (!admissibilidade || admissibilidade.length == 0)
      throw new InternalServerErrorException('Nenhuma subprefeitura encontrada');
    return admissibilidade;
  }

  async buscarTudo(
    pagina: number, limite: number, filtro: number, busca?: string
  ): Promise<AdmissibilidadePaginado> {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const searchParams = {
      ...(busca ?
        {
          OR: [
            { sei: { contains: busca } },
          ]
        } :
        {}),
    };
    const total: number = await this.prisma.admissibilidade.count({
      where: {
        inicial: { ...searchParams }
      }
    });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const admissibilidades: AdmissibilidadeResponseDTO[] = await this.prisma.admissibilidade.findMany({
      include: {
        inicial: true
      },
      where: {
        status: filtro === -1 ? undefined : filtro,
        inicial: { ...searchParams }
      },
      skip: (pagina - 1) * limite,
      take: limite,
    });
    if (!admissibilidades)
      throw new ForbiddenException('Nenhum processo encontrado');
    return {
      data: admissibilidades,
      total,
      pagina,
      limite
    };
  }

  async findAll(): Promise<AdmissibilidadeResponseDTO[]> {
    const admissibilidade: AdmissibilidadeResponseDTO[] = await this.prisma.admissibilidade.findMany();
    if (!admissibilidade || admissibilidade.length == 0)
      throw new InternalServerErrorException('Nenhuma subprefeitura encontrada');
    return admissibilidade;
  }

  async buscarPorId(id: number): Promise<Admissibilidade> {
    const admissibilidade = await this.prisma.admissibilidade.findUnique({
      where: { inicial_id: id },
      include: { inicial: true }
    });
    if (!admissibilidade)
      throw new InternalServerErrorException('Nenhuma admissibilidade encontrada');
    return admissibilidade;
  }

  async ultimaAtualizacao(id: number) {
    const inicial = await this.prisma.inicial.update({
      where: { id },
      data: { alterado_em: new Date() }
    })
    if (!inicial)
      throw new InternalServerErrorException('Nenhum processo encontrado');
    return inicial;
  }

  async atualizarStatus(
    id: number,
    updateAdmissibilidadeDto: UpdateAdmissibilidadeDto
  ): Promise<Admissibilidade> {
    const { interfaces, tipo_processo, inicial_id } = updateAdmissibilidadeDto;
    const admissibilidade: Admissibilidade = await this.prisma.admissibilidade.update({
      where: { inicial_id: id },
      data: updateAdmissibilidadeDto
    });
    if (tipo_processo) {
      await this.prisma.inicial.update({
        where: { id: inicial_id },
        data: { tipo_processo }
      });
      this.ultimaAtualizacao(id)
    };
    if (tipo_processo === 2 && interfaces) {
      this.ultimaAtualizacao(id)
      const interface_nova = this.prisma.interface.upsert({
        where: { inicial_id },
        create: {
          inicial_id,
          ...interfaces
        },
        update: { ...interfaces }
      });
    }
    if (!admissibilidade)
      throw new InternalServerErrorException('Nenhuma admissibilidade encontrada');
    this.ultimaAtualizacao(id)
    return admissibilidade;
  }

  remove(id: number): string {
    return `This action removes a #${id} admissibilidade`;
  }

  async verificaDiasUteis(data: string, dias: number): Promise<DiasUteis> {
    const feriado = await fetch(`${process.env.API_FERIADOS_URL}/feriados/diasUteisCorridos/${data}/${dias}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    }).then((response) => {
      return response.json();
    })
    return feriado;
  }

  dataExperacaoNaoUtil(data: string, dias: number) {
    const dataExperacao = new Date(data);
    dataExperacao.setDate(dataExperacao.getDate() + dias);
    return dataExperacao;
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async verificaReconsideracao() {    
    const reconsiderados = await this.prisma.admissibilidade.findMany({
      where: {
        AND: [
          { status: 3 },
          { data_decisao_interlocutoria: { not: null } }
        ]
      },
      select: {
        inicial_id: true,
        data_decisao_interlocutoria: true,
        inicial: {
          select: {
            alvara_tipo: {
              select: {
                reconsideracao_multi: true,
                reconsideracao_smul: true,
                reconsideracao_multi_tipo: true,
                reconsideracao_smul_tipo: true
              }
            },
            tipo_processo: true
          }
        }
      }
    })

    if (!reconsiderados) throw new InternalServerErrorException('Nenhum processo encontrado');
    
    for (let i = 0; i < reconsiderados.length; i++) {
      
      let dataFinal: Date;
      
      if (reconsiderados[i].inicial.tipo_processo === 1 && reconsiderados[i].inicial.alvara_tipo.reconsideracao_smul_tipo === 0) {
        const diasUteisSmul = await this.verificaDiasUteis(reconsiderados[i].data_decisao_interlocutoria.toString(), reconsiderados[i].inicial.alvara_tipo.reconsideracao_smul);
        dataFinal = new Date(diasUteisSmul.dataExpiracao.valueOf());
      } else  {
        dataFinal = this.dataExperacaoNaoUtil(reconsiderados[i].data_decisao_interlocutoria.toString(), reconsiderados[i].inicial.alvara_tipo.reconsideracao_smul)
      }  

      console.log(dataFinal);
      
      if (new Date() >= dataFinal) {
        await this.prisma.admissibilidade.update({
          where: { inicial_id: reconsiderados[i].inicial_id },
          data: { status: 2 }
        })
        await this.prisma.inicial.update({
          where: { id: reconsiderados[i].inicial_id },
          data: { status: 1 }
        })
      }
    }
    return reconsiderados;
  }
}
