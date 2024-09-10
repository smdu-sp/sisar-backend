import { PartialType } from '@nestjs/swagger';
import { CreateParecerAdmissibilidadeDto } from './create-parecer_admissibilidade.dto';

export class UpdateParecerAdmissibilidadeDto extends PartialType(CreateParecerAdmissibilidadeDto) {}
