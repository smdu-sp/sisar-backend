import { UsuarioEntity } from "src/usuario/entities/usuario.entity";

declare global {
  namespace Express {
    export interface Request {
      usuario?: UsuarioEntity;
    }
  }
}