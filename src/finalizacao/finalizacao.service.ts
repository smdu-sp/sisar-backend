import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateFinalizacaoDto } from './dto/create-finalizacao.dto';
import { UpdateFinalizacaoDto } from './dto/update-finalizacao.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { FinalizacaoPaginado, FinalizacaoResponseDTO } from './dto/finalizacao-response.dto';
import { Conclusao } from '@prisma/client';

@Injectable()
export class FinalizacaoService {
  constructor(private prisma: PrismaService, private app: AppService) {}

  private parseDataCampo(valor: Date | string | undefined | null): Date {
    if (valor == null || valor === '') {
      throw new BadRequestException('Data inválida.');
    }
    if (valor instanceof Date) return valor;
    const texto = String(valor).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return new Date(`${texto}T12:00:00.000Z`);
    const data = new Date(texto);
    if (Number.isNaN(data.getTime())) throw new BadRequestException('Data inválida.');
    return data;
  }

  async criar(createFinalizacaoDto: CreateFinalizacaoDto): Promise<Conclusao> {
    let { inicial_id, data_apostilamento, data_conclusao, data_emissao, data_outorga, data_resposta, data_termo, num_alvara, obs, outorga } = createFinalizacaoDto;
    data_apostilamento = this.parseDataCampo(data_apostilamento);
    data_conclusao = this.parseDataCampo(data_conclusao);
    data_emissao = this.parseDataCampo(data_emissao);
    data_outorga = this.parseDataCampo(data_outorga);
    data_resposta = this.parseDataCampo(data_resposta);
    data_termo = this.parseDataCampo(data_termo);
    const inicial = await this.prisma.inicial.findUnique({ where: { id: inicial_id } });
    if (!inicial) throw new InternalServerErrorException('Processo não encontrado');
    if (inicial.status !== 3) {
      throw new InternalServerErrorException(
        'Finalização só é permitida para processos deferidos na análise técnica.',
      );
    }
    const existente = await this.prisma.conclusao.findUnique({
      where: { inicial_id },
    });
    if (existente) {
      throw new InternalServerErrorException(
        'Este processo já possui registro de finalização.',
      );
    }
    const criar: Conclusao = await this.prisma.conclusao.create({
      data: { inicial_id, data_apostilamento, data_conclusao, data_emissao, data_outorga, data_resposta, data_termo, num_alvara, obs, outorga }
    })
    if (!criar) throw new InternalServerErrorException('Erro ao criar a finalização')
    return criar;
  }

  async buscarTudo(pagina: number = 1, limite: number = 10, busca?: string): Promise<FinalizacaoPaginado> {
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
    const total: number = await this.prisma.conclusao.count({ where: searchParams });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const iniciais: FinalizacaoResponseDTO[] = await this.prisma.conclusao.findMany({
      where: searchParams,
      include: { inicial: true },
      skip: (pagina - 1) * limite,
      take: limite
    });
    if (!iniciais) throw new InternalServerErrorException('Nenhum processo encontrado');
    return {
      total: +total,
      pagina: +pagina,
      limite: +limite,
      data: iniciais,
    };
  }

  async buscaId(id: number): Promise<Conclusao> {
    const buscaId: Conclusao = await this.prisma.conclusao.findUnique({
      where: { inicial_id: id }
    })
    if (!buscaId) throw new InternalServerErrorException('Processo não encontrado');
    return buscaId
  }

  async atualizar(id: number, updateFinalizacaoDto: UpdateFinalizacaoDto): Promise<Conclusao> {
    let { inicial_id, data_apostilamento, data_conclusao, data_emissao, data_outorga, data_resposta, data_termo, num_alvara, obs, outorga } = updateFinalizacaoDto;
    if (data_apostilamento != null) data_apostilamento = this.parseDataCampo(data_apostilamento);
    if (data_conclusao != null) data_conclusao = this.parseDataCampo(data_conclusao);
    if (data_emissao != null) data_emissao = this.parseDataCampo(data_emissao);
    if (data_outorga != null) data_outorga = this.parseDataCampo(data_outorga);
    if (data_resposta != null) data_resposta = this.parseDataCampo(data_resposta);
    if (data_termo != null) data_termo = this.parseDataCampo(data_termo);
    const atualizar: Conclusao = await this.prisma.conclusao.update({
      where: { inicial_id: id },
      data: { inicial_id, data_apostilamento, data_conclusao, data_emissao, data_outorga, data_resposta, data_termo, num_alvara, obs, outorga }
    })
    if (!atualizar) throw new InternalServerErrorException('Não foi possivel atualizar o processo finalizado');
    return atualizar
  }
}
