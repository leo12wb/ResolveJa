import api from './api'
import type { AuthResponse, LoginRequest } from '../types'

interface RegistroRequest {
  nome: string
  email: string
  senha: string
  consentimentoLgpd: boolean
}

export const authService = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  registro: (data: RegistroRequest) =>
    api.post<AuthResponse>('/auth/registro', data).then((r) => r.data),

  recuperarSenha: (email: string) =>
    api.post('/auth/recuperar-senha', { email }).then((r) => r.data),

  redefinirSenha: (token: string, novaSenha: string) =>
    api.post('/auth/redefinir-senha', { token, novaSenha }).then((r) => r.data),
}
