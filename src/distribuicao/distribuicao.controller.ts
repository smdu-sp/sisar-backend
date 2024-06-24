import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DistribuicaoService } from './distribuicao.service';
import { CreateDistribuicaoDto } from './dto/create-distribuicao.dto';
import { UpdateDistribuicaoDto } from './dto/update-distribuicao.dto';

@Controller('distribuicao')
export class DistribuicaoController {
  constructor(private readonly distribuicaoService: DistribuicaoService) {}

  @Post('criar')
  criar(@Body() createDistribuicaoDto: CreateDistribuicaoDto) {
    return this.distribuicaoService.criar(createDistribuicaoDto);
  }

  @Patch('atualizar/:inicial_id')
  atualizar(@Param('inicial_id') inicial_id: string, @Body() updateDistribuicaoDto: UpdateDistribuicaoDto) {
    return this.distribuicaoService.atualizar(+inicial_id, updateDistribuicaoDto);
  }

  @Patch('administrativo/atualizar/:inicial_id')
  mudarAdministrativoResponsavel(@Param('inicial_id') inicial_id: string, @Body() { administrativo_responsavel_id }: { administrativo_responsavel_id: string }) {
    return this.distribuicaoService.mudarAdministrativoResponsavel(+inicial_id, administrativo_responsavel_id);
  }

  @Patch('tecnico/atualizar/:inicial_id')
  mudarTecnicoResponsavel(@Param('inicial_id') inicial_id: string, @Body() { tecnico_responsavel_id }: { tecnico_responsavel_id: string }) {
    return this.distribuicaoService.mudarTecnicoResponsavel(+inicial_id, tecnico_responsavel_id);
  }
}
