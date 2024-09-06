import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AvisosService } from './avisos.service';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { UpdateAvisoDto } from './dto/update-aviso.dto';
import { UsuarioAtual } from 'src/auth/decorators/usuario-atual.decorator';
import { Usuario } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Avisos')
@Controller('avisos')
export class AvisosController {
  constructor(private readonly avisosService: AvisosService) {}

  @Post('criar')
  create(@Body() createAvisoDto: CreateAvisoDto, @UsuarioAtual() usuario: Usuario) {
    return this.avisosService.create(createAvisoDto, createAvisoDto.tipo === 1 ? usuario.id : null);
  }

  @Get('buscar/:data')
  findOne(@Param('data') data: Date, @UsuarioAtual() usuario: Usuario) {
    return this.avisosService.findOne(data, usuario.id);
  }

  @Get('buscar/:mes/:ano')
  buscarPorMesAno(@Param('mes') mes: string, @Param('ano') ano: string, @UsuarioAtual() usuario: Usuario) {
    return this.avisosService.buscarPorMesAno(parseInt(mes), parseInt(ano), usuario.id);
  }

  @Patch('atualizar/:id')
  update(@Param('id') id: string, @Body() updateAvisoDto: UpdateAvisoDto) {
    return this.avisosService.update(id, updateAvisoDto);
  }

  @Delete('excluir/:id')
  remove(@Param('id') id: string) {
    return this.avisosService.remove(id);
  }
}
