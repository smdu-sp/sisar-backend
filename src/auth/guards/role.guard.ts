import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UsuarioService } from "src/usuario/usuario.service";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly usuarioService: UsuarioService
    ) {}

    verificaPermissoes(permissoes: string[], permissaoUsuario: string) {
        if (permissaoUsuario === "DEV") return true;
        return permissoes.some((role) => role === permissaoUsuario);
    }
    
    async canActivate(context: ExecutionContext) {
        const permissoes = this.reflector.get<string[]>('permissoes', context.getHandler());
        if(!permissoes) return true;
        const request = context.switchToHttp().getRequest();
        const usuario = request.user;
        const permissao = await this.usuarioService.retornaPermissao(usuario.id);
        return this.verificaPermissoes(permissoes, permissao);
    }
}