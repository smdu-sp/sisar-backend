import { ApiProperty } from "@nestjs/swagger";

export class CreateParecerAdmissibilidadeDto {
    @ApiProperty()
    parecer: string;
    @ApiProperty()
    status: number = 1;
}
