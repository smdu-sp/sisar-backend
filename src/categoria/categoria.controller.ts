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
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@ApiTags('Categorias')
@ApiBearerAuth()
@Controller('categorias')
export class CategoriaController {
  constructor(private readonly service: CategoriaService) {}

  @Permissoes('SUP', 'ADM')
  @Post('criar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar categoria' })
  criar(@Body() dto: CreateCategoriaDto) {
    return this.service.criar(dto);
  }

  @Get('buscar-tudo')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'pagina', required: false })
  @ApiQuery({ name: 'limite', required: false })
  @ApiQuery({ name: 'busca', required: false })
  @ApiOperation({ summary: 'Listar categorias paginado' })
  buscarTudo(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('busca') busca?: string,
  ) {
    return this.service.buscarTudo(+pagina, +limite, busca);
  }

  @Get('lista-completa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lista completa de categorias' })
  listaCompleta() {
    return this.service.listaCompleta();
  }

  @Get('buscar-por-id/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar categoria por id' })
  buscarPorId(@Param('id') id: string) {
    return this.service.buscarPorId(id);
  }

  @Permissoes('SUP', 'ADM')
  @Patch('atualizar/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar categoria' })
  atualizar(@Param('id') id: string, @Body() dto: UpdateCategoriaDto) {
    return this.service.atualizar(id, dto);
  }

  @Permissoes('SUP', 'ADM')
  @Delete('remover/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover categoria' })
  remover(@Param('id') id: string) {
    return this.service.remover(id);
  }
}
