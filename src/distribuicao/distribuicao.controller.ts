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
}
