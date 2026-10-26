import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { clienteService } from '../../services/clienteService'

interface Form {
  nome: string; telefone: string; email: string; endereco: string; observacoes: string
}

const EMPTY: Form = { nome: '', telefone: '', email: '', endereco: '', observacoes: '' }

export default function ClienteFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editando = Boolean(id)
  const [form, setForm] = useState<Form>(EMPTY)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (field: keyof Form, value: any) => setForm((f) => ({ ...f, [field]: value }))

  useEffect(() => {
    if (!id) return
    clienteService.buscar(id).then((c) =>
      setForm({ nome: c.nome, telefone: c.telefone ?? '', email: c.email ?? '', endereco: c.endereco ?? '', observacoes: c.observacoes ?? '' })
    )
  }, [id])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(''); setCarregando(true)
    try {
      const payload = {
        nome: form.nome,
        telefone: form.telefone || undefined,
        email: form.email || undefined,
        endereco: form.endereco || undefined,
        observacoes: form.observacoes || undefined,
      }
      if (editando && id) {
        await clienteService.atualizar(id, payload)
        navigate(`/clientes/${id}`)
      } else {
        const novo = await clienteService.criar(payload)
        navigate(`/clientes/${novo.id}`)
      }
    } catch (err: unknown) {
      setErro((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro ao salvar cliente.')
    } finally { setCarregando(false) }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/clientes" className="text-gray-400 hover:text-gray-600">← Clientes</Link>
        <h1 className="text-2xl font-bold text-gray-800">{editando ? 'Editar cliente' : 'Novo cliente'}</h1>
      </div>

      <div className="card">
        {erro && <div className="mb-4 rounded-md bg-red-50 border border-red-300 px-4 py-3 text-sm text-red-700">{erro}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nome completo *</label>
            <input type="text" required value={form.nome} onChange={(e) => set('nome', e.target.value)} className="input-field" placeholder="Nome do cliente" />
          </div>
          <div>
            <label className="label">Telefone</label>
            <input type="tel" value={form.telefone} onChange={(e) => set('telefone', e.target.value.replace(/\D/g, ''))} className="input-field" placeholder="11999990000" maxLength={11} />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="input-field" placeholder="cliente@email.com" />
          </div>
          <div>
            <label className="label">Endereço</label>
            <input type="text" value={form.endereco} onChange={(e) => set('endereco', e.target.value)} className="input-field" placeholder="Rua, número, bairro, cidade" />
          </div>
          <div>
            <label className="label">Observações</label>
            <textarea rows={3} value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} className="input-field resize-none" placeholder="Notas internas sobre o cliente..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={carregando} className="btn-primary">
              {carregando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Criar cliente'}
            </button>
            <Link to="/clientes" className="btn-secondary">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
