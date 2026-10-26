import { useState, FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../../services/authService'

export default function RedefinirSenhaPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [novaSenha, setNovaSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(''); setCarregando(true)
    try {
      await authService.redefinirSenha(token, novaSenha)
      navigate('/login?redefinido=1')
    } catch (err: unknown) {
      setErro((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Token inválido ou expirado.')
    } finally { setCarregando(false) }
  }

  if (!token) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="card text-center space-y-4">
        <p className="text-red-600">Link de recuperação inválido.</p>
        <Link to="/recuperar-senha" className="btn-primary inline-block">Solicitar novo link</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700">ResolveJá</h1>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Criar nova senha</h2>
          {erro && <div className="mb-4 rounded-md bg-red-50 border border-red-300 px-4 py-3 text-sm text-red-700">{erro}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="novaSenha" className="label">Nova senha</label>
              <input id="novaSenha" type="password" required minLength={8} value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} className="input-field" placeholder="Mín. 8 chars, 1 maiúscula e 1 número" />
            </div>
            <button type="submit" disabled={carregando} className="btn-primary w-full">{carregando ? 'Salvando...' : 'Salvar nova senha'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
