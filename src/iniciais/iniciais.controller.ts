import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  //Delete,
  Query,
} from '@nestjs/common';
import { IniciaisService } from './iniciais.service';
import { CreateInicialDto } from './dto/create-inicial.dto';
import { UpdateInicialDto } from './dto/update-inicial.dto';

@Controller('iniciais')
export class IniciaisController {
  constructor(private readonly iniciaisService: IniciaisService) {}

  @Post()
  create(@Body() createInicialDto: CreateInicialDto) {
    return this.iniciaisService.create(createInicialDto);
  }

  @Get()
  findAll(@Query('pagina') pagina: number = 1, @Query('limite') limite: number = 10) {
    return this.iniciaisService.findAll(+pagina, +limite);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.iniciaisService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInicialDto: UpdateInicialDto) {
    return this.iniciaisService.update(+id, updateInicialDto);
  }

  @Get('valida-sql/:sql')
  validaSql(@Param('sql') sql: string) {
    return this.iniciaisService.validaSql(sql);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.iniciaisService.remove(+id);
  // }
}
