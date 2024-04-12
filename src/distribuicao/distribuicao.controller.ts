import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DistribuicaoService } from './distribuicao.service';
import { CreateDistribuicaoDto } from './dto/create-distribuicao.dto';
import { UpdateDistribuicaoDto } from './dto/update-distribuicao.dto';

@Controller('distribuicao')
export class DistribuicaoController {
  constructor(private readonly distribuicaoService: DistribuicaoService) {}

  @Post()
  create(@Body() createDistribuicaoDto: CreateDistribuicaoDto) {
    return this.distribuicaoService.create(createDistribuicaoDto);
  }

  @Get()
  findAll() {
    return this.distribuicaoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.distribuicaoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDistribuicaoDto: UpdateDistribuicaoDto) {
    return this.distribuicaoService.update(+id, updateDistribuicaoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.distribuicaoService.remove(+id);
  }
}
