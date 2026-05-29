import { PartialType } from '@nestjs/swagger';
import { CreateMotivoInadmissaoDto } from './create-motivo-inadmissao.dto';

export class UpdateMotivoInadmissaoDto extends PartialType(
  CreateMotivoInadmissaoDto,
) {}
