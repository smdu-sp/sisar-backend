import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SecretariaService } from './secretaria.service';
import { CreateSecretariaDto } from './dto/create-secretaria.dto';
import { UpdateSecretariaDto } from './dto/update-secretaria.dto';

@Controller('secretaria')
export class SecretariaController {
  constructor(private readonly secretariaService: SecretariaService) {}

  @Post()
  create(@Body() createSecretariaDto: CreateSecretariaDto) {
    return this.secretariaService.create(createSecretariaDto);
  }

  @Get()
  findAll() {
    return this.secretariaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.secretariaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSecretariaDto: UpdateSecretariaDto) {
    return this.secretariaService.update(+id, updateSecretariaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.secretariaService.remove(+id);
  }
}
