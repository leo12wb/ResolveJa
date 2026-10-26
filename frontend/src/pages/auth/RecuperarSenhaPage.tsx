import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../../services/authService'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setCarregando(true)
    try { await authService.recuperarSenha(email) }
    catch { /* sempre mostra sucesso (anti-enumeration) */ }
    finally { setEnviado(true); setCarregando(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700">ResolveJá</h1>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recuperar senha</h2>
          {enviado ? (
            <div className="space-y-4">
              <p className="bg-green-50 border border-green-300 rounded-md px-4 py-3 text-sm text-green-700">Se o e-mail estiver cadastrado, você receberá as instruções em breve.</p>
              <Link to="/login" className="btn-secondary w-full block text-center">Voltar ao login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-500">Informe seu e-mail e enviaremos um link para redefinir sua senha.</p>
              <div>
                <label htmlFor="email" className="label">E-mail</label>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="seu@email.com" />
              </div>
              <button type="submit" disabled={carregando} className="btn-primary w-full">{carregando ? 'Enviando...' : 'Enviar link'}</button>
              <Link to="/login" className="block text-center text-sm text-primary-600 hover:underline">Voltar ao login</Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
