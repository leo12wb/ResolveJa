import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'

export default function RegistroPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [form, setForm] = useState({ nome: '', email: '', senha: '', consentimento: false })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.consentimento) { setErro('Você deve aceitar a Política de Privacidade.'); return }
    setErro(''); setCarregando(true)
    try {
      const data = await authService.registro({ nome: form.nome, email: form.email, senha: form.senha, consentimentoLgpd: form.consentimento })
      login(data.token, data.prestador)
      navigate('/dashboard')
    } catch (err: unknown) {
      setErro((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro ao criar conta.')
    } finally { setCarregando(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700">ResolveJá</h1>
          <p className="text-gray-500 mt-1 text-sm">Crie sua conta gratuitamente</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Criar conta</h2>
          {erro && <div className="mb-4 rounded-md bg-red-50 border border-red-300 px-4 py-3 text-sm text-red-700">{erro}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nome" className="label">Nome completo</label>
              <input id="nome" type="text" required value={form.nome} onChange={(e) => set('nome', e.target.value)} className="input-field" placeholder="Seu nome" />
            </div>
            <div>
              <label htmlFor="email" className="label">E-mail</label>
              <input id="email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} className="input-field" placeholder="seu@email.com" />
            </div>
            <div>
              <label htmlFor="senha" className="label">Senha</label>
              <input id="senha" type="password" required minLength={8} value={form.senha} onChange={(e) => set('senha', e.target.value)} className="input-field" placeholder="Mín. 8 chars, 1 maiúscula e 1 número" />
            </div>
            <div className="flex items-start gap-3">
              <input id="consentimento" type="checkbox" checked={form.consentimento} onChange={(e) => set('consentimento', e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <label htmlFor="consentimento" className="text-sm text-gray-600">
                Li e aceito a{' '}
                <Link to="/privacidade" target="_blank" className="text-primary-600 hover:underline">Política de Privacidade</Link>
                {' '}e os{' '}
                <Link to="/termos" target="_blank" className="text-primary-600 hover:underline">Termos de Uso</Link>
              </label>
            </div>
            <button type="submit" disabled={carregando} className="btn-primary w-full">{carregando ? 'Criando conta...' : 'Criar conta'}</button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">Já tem conta?{' '}<Link to="/login" className="text-primary-600 font-medium hover:underline">Entrar</Link></p>
        </div>
      </div>
    </div>
  )
}
