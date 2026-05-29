import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';
import { CoordenadoriaService } from './coordenadoria.service';
import { CreateCoordenadoriaDto } from './dto/create-coordenadoria.dto';
import { UpdateCoordenadoriaDto } from './dto/update-coordenadoria.dto';

@ApiTags('Coordenadorias')
@ApiBearerAuth()
@Controller('coordenadorias')
export class CoordenadoriaController {
  constructor(private readonly service: CoordenadoriaService) {}

  @Permissoes('SUP', 'ADM')
  @Post('criar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar coordenadoria' })
  criar(@Body() dto: CreateCoordenadoriaDto) {
    return this.service.criar(dto);
  }

  @Get('buscar-tudo')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'pagina', required: false })
  @ApiQuery({ name: 'limite', required: false })
  @ApiQuery({ name: 'busca', required: false })
  buscarTudo(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('busca') busca?: string,
  ) {
    return this.service.buscarTudo(+pagina, +limite, busca);
  }

  @Get('lista-completa')
  @HttpCode(HttpStatus.OK)
  listaCompleta() {
    return this.service.listaCompleta();
  }

  @Get('buscar-por-id/:id')
  @HttpCode(HttpStatus.OK)
  buscarPorId(@Param('id') id: string) {
    return this.service.buscarPorId(id);
  }

  @Permissoes('SUP', 'ADM')
  @Patch('atualizar/:id')
  @HttpCode(HttpStatus.OK)
  atualizar(@Param('id') id: string, @Body() dto: UpdateCoordenadoriaDto) {
    return this.service.atualizar(id, dto);
  }

  @Permissoes('SUP', 'ADM')
  @Delete('remover/:id')
  @HttpCode(HttpStatus.OK)
  remover(@Param('id') id: string) {
    return this.service.remover(id);
  }
}
