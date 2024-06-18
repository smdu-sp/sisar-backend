import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AvisosService } from './avisos.service';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { UpdateAvisoDto } from './dto/update-aviso.dto';
import { UsuarioAtual } from 'src/auth/decorators/usuario-atual.decorator';
import { Usuario } from '@prisma/client';

@Controller('avisos')
export class AvisosController {
  constructor(private readonly avisosService: AvisosService) {}

  @Post('criar')
  create(@Body() createAvisoDto: CreateAvisoDto, @UsuarioAtual() usuario: Usuario) {
    return this.avisosService.create(createAvisoDto, usuario.id);
  }

  @Get('buscar/:data')
  findOne(@Param('data') data: Date) {
    return this.avisosService.findOne(data);
  }

  @Get('buscar/:mes/:ano')
  buscarPorMesAno(@Param('mes') mes: string, @Param('ano') ano: string) {
    return this.avisosService.buscarPorMesAno(parseInt(mes), parseInt(ano));
  }

  @Patch('atualizar/:id')
  update(@Param('id') id: string, @Body() updateAvisoDto: UpdateAvisoDto) {
    return this.avisosService.update(id, updateAvisoDto);
  }

  @Delete('excluir:id')
  remove(@Param('id') id: string) {
    return this.avisosService.remove(id);
  }
}
