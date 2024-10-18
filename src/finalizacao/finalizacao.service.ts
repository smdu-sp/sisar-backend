import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateFinalizacaoDto } from './dto/create-finalizacao.dto';
import { UpdateFinalizacaoDto } from './dto/update-finalizacao.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { FinalizacaoPaginado } from './dto/finalizacao-response.dto';

@Injectable()
export class FinalizacaoService {
  constructor(
    private prisma: PrismaService,
    private app: AppService
  ) {}

  async criar(createFinalizacaoDto: CreateFinalizacaoDto, conclusao: boolean) {
    let { inicial_id, data_apostilamento, data_conclusao, data_emissao, data_outorga, data_resposta, data_termo, num_alvara, obs, outorga } = createFinalizacaoDto;
    const criar = await this.prisma.conclusao.create({
      data: { inicial_id, data_apostilamento, data_conclusao, data_emissao, data_outorga, data_resposta, data_termo, num_alvara, obs, outorga }
    })
    if (!criar) throw new InternalServerErrorException('Erro ao criar a finalização')
    await this.prisma.inicial.update({
      where: { id: inicial_id },
      data: { status: conclusao ? 3 : 4 }
    })
    return criar;
  }

  async buscarTudo(
    pagina: number = 1,
    limite: number = 10,
    busca?: string
  ): Promise<FinalizacaoPaginado> {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const searchParams = {
      ...(busca ?
        {
          OR: [
            { obs: { contains: busca } },
          ]
        } :
        {})
    };
    const total = await this.prisma.conclusao.count({ where: searchParams });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const iniciais = await this.prisma.conclusao.findMany({
      where: searchParams,
      include: {
        inicial: true,
      },
      skip: (pagina - 1) * limite,
      take: limite,
    });
    if (!iniciais) throw new InternalServerErrorException('Nenhum processo encontrado');
    return {
      total: +total,
      pagina: +pagina,
      limite: +limite,
      data: iniciais,
    };
  }

  async buscaId(id: number) {
    const buscaId = await this.prisma.conclusao.findUnique({
      where: { inicial_id: id }
    })
    if (!buscaId) throw new InternalServerErrorException('Processo não encontrado');
    return buscaId
  }

  async atualizar(id: number, updateFinalizacaoDto: UpdateFinalizacaoDto) {
    let { inicial_id, data_apostilamento, data_conclusao, data_emissao, data_outorga, data_resposta, data_termo, num_alvara, obs, outorga } = updateFinalizacaoDto;
    const atualizar = await this.prisma.conclusao.update({
      where: { inicial_id: id },
      data: { inicial_id, data_apostilamento, data_conclusao, data_emissao, data_outorga, data_resposta, data_termo, num_alvara, obs, outorga }
    })
    if (!atualizar) throw new InternalServerErrorException('Não foi possivel atualizar o processo finalizado');
    return atualizar
  }
}
