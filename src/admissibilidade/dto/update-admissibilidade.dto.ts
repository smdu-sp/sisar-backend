import { PartialType } from '@nestjs/swagger';
import { CreateAdmissibilidadeDto } from './create-admissibilidade.dto';

export class UpdateAdmissibilidadeDto extends PartialType(CreateAdmissibilidadeDto) {}
