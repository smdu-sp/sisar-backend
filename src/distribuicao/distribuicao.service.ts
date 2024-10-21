import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateDistribuicaoDto } from './dto/create-distribuicao.dto';
import { UpdateDistribuicaoDto } from './dto/update-distribuicao.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DistribuicaoService {
  constructor(
    private prisma: PrismaService,
  ) {}
  async criar(createDistribuicaoDto: CreateDistribuicaoDto) {
    const distribuicao = await this.prisma.distribuicao.findUnique({
      where: { inicial_id: createDistribuicaoDto.inicial_id }
    });
    if (distribuicao) throw new ForbiddenException('Erro ao criar distribuição. Processo já foi alocado.');
    const nova_distribuicao = await this.prisma.distribuicao.create({
      data: createDistribuicaoDto
    });
    if (!nova_distribuicao) throw new ForbiddenException('Erro ao criar distribuição. Tente novamente.');
    return nova_distribuicao;
  }

  async atualizar(inicial_id: number, updateDistribuicaoDto: UpdateDistribuicaoDto) {
    const distribuicao = await this.prisma.distribuicao.findUnique({
      where: { inicial_id: inicial_id },
      include: {
        tecnico_responsavel: true,
        administrativo_responsavel: true
      }
    });
    if (distribuicao) throw new ForbiddenException('Erro ao atualizar distribuição. Processo não existe.');
    const { administrativo_responsavel_id, tecnico_responsavel_id } = updateDistribuicaoDto;
    const atualiza_distribuicao = await this.prisma.distribuicao.update({
      where: { inicial_id },
      data: {
        ...(administrativo_responsavel_id && { administrativo_responsavel_id }),
        ...(tecnico_responsavel_id && { tecnico_responsavel_id })
      }
    }).catch(error => {
      console.log(error);
    });
    if (!atualiza_distribuicao) throw new ForbiddenException('Erro ao atualizar distribuição. Tente novamente.');
    return atualiza_distribuicao;
  }

  async mudarAdministrativoResponsavel(inicial_id: number, administrativo_responsavel_id: string) {
    const distribuicao = await this.prisma.distribuicao.findUnique({
      where: { inicial_id: inicial_id }
    });
    if (!distribuicao) throw new ForbiddenException('Erro ao atualizar distribuição. Processo não existe.');
    const atualiza_distribuicao = await this.prisma.distribuicao.update({
      where: { inicial_id },
      data: {
        administrativo_responsavel_id
      }
    })
    if (!atualiza_distribuicao) throw new ForbiddenException('Erro ao atualizar distribuição. Tente novamente.');
    return atualiza_distribuicao;
  }

  async mudarTecnicoResponsavel(inicial_id: number, tecnico_responsavel_id: string) {
    const distribuicao = await this.prisma.distribuicao.findUnique({
      where: { inicial_id: inicial_id }
    });
    if (!distribuicao) throw new ForbiddenException('Erro ao atualizar distribuição. Processo não existe.');
    const atualiza_distribuicao = await this.prisma.distribuicao.update({
      where: { inicial_id },
      data: {
        tecnico_responsavel_id
      }
    })
    if (!atualiza_distribuicao) throw new ForbiddenException('Erro ao atualizar distribuição. Tente novamente.');
    return atualiza_distribuicao;
  }
}
