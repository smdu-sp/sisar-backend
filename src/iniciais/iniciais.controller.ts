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
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.iniciaisService.findAll(+page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.iniciaisService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInicialDto: UpdateInicialDto) {
    return this.iniciaisService.update(+id, updateInicialDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.iniciaisService.remove(+id);
  // }
}
