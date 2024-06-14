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
      where: { inicial_id: inicial_id }
    });
    if (distribuicao) throw new ForbiddenException('Erro ao atualizar distribuição. Processo não existe.');
    const atualiza_distribuicao = await this.prisma.distribuicao.update({
      where: { inicial_id },
      data: updateDistribuicaoDto
    });
    if (!atualiza_distribuicao) throw new ForbiddenException('Erro ao atualizar distribuição. Tente novamente.');
    return atualiza_distribuicao;
  }
}
