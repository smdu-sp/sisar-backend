import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlvaraTipoService } from './alvara_tipo.service';
import { CreateAlvaraTipoDto } from './dto/create-alvara_tipo.dto';
import { UpdateAlvaraTipoDto } from './dto/update-alvara_tipo.dto';

@Controller('alvara-tipo')
export class AlvaraTipoController {
  constructor(private readonly alvaraTipoService: AlvaraTipoService) {}

  @Post()
  create(@Body() createAlvaraTipoDto: CreateAlvaraTipoDto) {
    return this.alvaraTipoService.create(createAlvaraTipoDto);
  }

  @Get()
  findAll() {
    return this.alvaraTipoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alvaraTipoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlvaraTipoDto: UpdateAlvaraTipoDto) {
    return this.alvaraTipoService.update(id, updateAlvaraTipoDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.alvaraTipoService.remove(id);
  // }
}
