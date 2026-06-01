import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InicialService } from 'src/inicial/inicial.service';
import { RegistrarPedidoReconsideracaoDto } from './dto/registrar-pedido.dto';

@Injectable()
export class ReconsideracaoService {
  constructor(
    private prisma: PrismaService,
    private inicialService: InicialService,
  ) {}

  private parseData(valor: Date | string | undefined): Date | undefined {
    if (valor == null) return undefined;
    if (valor instanceof Date) return valor;
    const texto = String(valor).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
      return new Date(`${texto}T12:00:00.000Z`);
    }
    const data = new Date(texto);
    if (Number.isNaN(data.getTime())) {
      throw new BadRequestException('Data inválida.');
    }
    return data;
  }

  async registrarPedido(
    inicialId: number,
    dto: RegistrarPedidoReconsideracaoDto,
  ) {
    const adm = await this.prisma.admissibilidade.findUnique({
      where: { inicial_id: inicialId },
    });
    if (!adm) throw new ForbiddenException('Admissibilidade não encontrada.');
    if (adm.status !== 3) {
      throw new BadRequestException(
        'Pedido de reconsideração só para processos em reconsideração.',
      );
    }

    await this.prisma.reconsideracao_Admissibilidade.upsert({
      where: { inicial_id: inicialId },
      create: {
        inicial_id: inicialId,
        pedido_reconsideracao: this.parseData(dto.pedido_reconsideracao),
        envio: this.parseData(dto.envio),
        publicacao: this.parseData(dto.publicacao),
        parecer: false,
      },
      update: {
        pedido_reconsideracao: this.parseData(dto.pedido_reconsideracao),
        envio: this.parseData(dto.envio),
        publicacao: this.parseData(dto.publicacao),
      },
    });

    await this.prisma.admissibilidade.update({
      where: { inicial_id: inicialId },
      data: { reconsiderado: true },
    });

    return { mensagem: 'Pedido de reconsideração registrado.' };
  }

  async aceitar(inicialId: number) {
    const adm = await this.prisma.admissibilidade.findUnique({
      where: { inicial_id: inicialId },
      include: { inicial: true },
    });
    if (!adm) throw new ForbiddenException('Admissibilidade não encontrada.');
    if (adm.status !== 3) {
      throw new BadRequestException('Processo não está em reconsideração.');
    }

    await this.prisma.admissibilidade.update({
      where: { inicial_id: inicialId },
      data: { status: 0 },
    });

    await this.prisma.reconsideracao_Admissibilidade.updateMany({
      where: { inicial_id: inicialId },
      data: { parecer: true },
    });

    const tipoProcesso = adm.inicial.tipo_processo ?? 1;
    await this.inicialService.atualizar(inicialId, {
      status: 2,
      etapa_analise: 1,
      substatus_analise: tipoProcesso === 2 ? 3 : 0,
      tipo_processo: tipoProcesso,
    });

    return {
      mensagem: 'Reconsideração aceita. Processo em análise técnica.',
    };
  }

  async rejeitar(inicialId: number) {
    const adm = await this.prisma.admissibilidade.findUnique({
      where: { inicial_id: inicialId },
    });
    if (!adm) throw new ForbiddenException('Admissibilidade não encontrada.');
    if (adm.status !== 3) {
      throw new BadRequestException('Processo não está em reconsideração.');
    }

    await this.prisma.admissibilidade.update({
      where: { inicial_id: inicialId },
      data: { status: 2 },
    });

    await this.prisma.inicial.update({
      where: { id: inicialId },
      data: { status: 1 },
    });

    return {
      mensagem: 'Reconsideração rejeitada. Processo encerrado por via ordinária.',
    };
  }

  async buscar(inicialId: number) {
    return this.prisma.reconsideracao_Admissibilidade.findUnique({
      where: { inicial_id: inicialId },
    });
  }
}
