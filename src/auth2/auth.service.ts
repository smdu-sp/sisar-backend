import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuarioService } from 'src/usuario/usuario.service';
import { AuthDto } from './dto/auth.dto';
import { Client, createClient } from 'ldapjs-promise';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private usuarioService: UsuarioService,
        private jwt: JwtService
    ) {}

    async login({ login, senha }: AuthDto) {
        const client: Client = createClient({
            url: process.env.LDAP_SERVER,
        });
        try {
            await client.bind(`${login}${process.env.LDAP_DOMAIN}`, senha);
            var usuario = await this.usuarioService.findByLogin(login);
            if (!usuario) {
                client.search(process.env.LDAP_BASE, {
                    filter: `samaccountname=${login}`,
                    scope: 'sub',
                    attributes: ['cn']
                }, []).then(response => {
                    response.on('searchEntry', async entry => {
                        const nome = JSON.parse(JSON.stringify(entry.attributes[0])).values[0];
                        const novo_usuario = await this.usuarioService.create({
                            nome,
                            login,
                            cargo: "USR",
                            permissao: "ADM",
                            status: 1
                        });
                        if (!novo_usuario || novo_usuario instanceof Error) return new UnauthorizedException("Não foi possível criar o usuário, tente novamente.");
                        usuario = novo_usuario;
                    });
                });
            }
            return this.signToken(usuario.id, usuario.login, usuario.cargo, usuario.permissao);
        } catch (error) {
            return new UnauthorizedException("Usuário ou senha inválidos.");
        }
    }
    
    async signToken(
        usuario_id: string,
        login: string,
        cargo: string,
        permissao: string,
    ): Promise<{ access_token: string }> {
        const payload = { usuario_id, login, cargo, permissao };
        const access_token = await this.jwt.signAsync(payload, {
            expiresIn: '1d',
            secret: process.env.JWT_SECRET,
        });
        return { access_token };
    }

    // async ldapNovoUsuario(login: string, client: Client) {
    // }

    // async ldapAuth({ login, senha }: AuthDto, usuario: Usuario) {
        
    // }
}
