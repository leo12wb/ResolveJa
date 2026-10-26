import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { servicoService } from '../../services/servicoService'
import { clienteService } from '../../services/clienteService'
import type { Cliente } from '../../types'

interface Form {
  clienteId: string; descricao: string; valor: string
  dataServico: string; observacoes: string; pago: boolean
}
const EMPTY: Form = { clienteId: '', descricao: '', valor: '', dataServico: '', observacoes: '', pago: false }

export default function ServicoFormPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const editando = Boolean(id)

  const [form, setForm] = useState<Form>({
    ...EMPTY,
    clienteId: searchParams.get('clienteId') ?? '',
  })
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (f: keyof Form, v: any) => setForm((prev) => ({ ...prev, [f]: v }))

  useEffect(() => {
    clienteService.listar({ size: 200 }).then((p) => setClientes(p.content))
  }, [])

  useEffect(() => {
    if (!id) return
    servicoService.buscar(id).then((s) =>
      setForm({
        clienteId: s.clienteId,
        descricao: s.descricao,
        valor: s.valor?.toString() ?? '',
        dataServico: s.dataServico ?? '',
        observacoes: s.observacoes ?? '',
        pago: s.pago,
      })
    )
  }, [id])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(''); setCarregando(true)
    try {
      const payload = {
        clienteId: form.clienteId,
        descricao: form.descricao,
        valor: form.valor ? Number(form.valor) : undefined,
        dataServico: form.dataServico || undefined,
        observacoes: form.observacoes || undefined,
        pago: form.pago,
      }
      if (editando && id) {
        await servicoService.atualizar(id, payload)
        navigate('/servicos')
      } else {
        await servicoService.criar(payload)
        navigate('/servicos')
      }
    } catch (err: unknown) {
      setErro((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro ao salvar serviço.')
    } finally { setCarregando(false) }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/servicos" className="text-gray-400 hover:text-gray-600">← Serviços</Link>
        <h1 className="text-2xl font-bold text-gray-800">{editando ? 'Editar serviço' : 'Novo serviço'}</h1>
      </div>

      <div className="card">
        {erro && <div className="mb-4 rounded-md bg-red-50 border border-red-300 px-4 py-3 text-sm text-red-700">{erro}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Cliente *</label>
            <select required value={form.clienteId} onChange={(e) => set('clienteId', e.target.value)} className="input-field">
              <option value="">Selecione um cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Descrição *</label>
            <textarea required rows={3} value={form.descricao} onChange={(e) => set('descricao', e.target.value)} className="input-field resize-none" placeholder="Descreva o serviço a ser realizado..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Valor (R$)</label>
              <input type="number" min="0" step="0.01" value={form.valor} onChange={(e) => set('valor', e.target.value)} className="input-field" placeholder="0,00" />
            </div>
            <div>
              <label className="label">Data do serviço</label>
              <input type="date" value={form.dataServico} onChange={(e) => set('dataServico', e.target.value)} className="input-field" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input id="pago" type="checkbox" checked={form.pago} onChange={(e) => set('pago', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <label htmlFor="pago" className="text-sm text-gray-700">Marcar como pago</label>
          </div>
          <div>
            <label className="label">Observações</label>
            <textarea rows={2} value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} className="input-field resize-none" placeholder="Notas internas..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={carregando} className="btn-primary">
              {carregando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Criar serviço'}
            </button>
            <Link to="/servicos" className="btn-secondary">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
