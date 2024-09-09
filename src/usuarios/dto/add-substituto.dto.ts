import { ApiProperty } from "@nestjs/swagger";

export class AddSubstitutoDTO {
    @ApiProperty()
    usuario_id: string;
    @ApiProperty()
    substituto_id: string;
}
