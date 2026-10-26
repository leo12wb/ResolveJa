import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { orcamentoService } from '../../services/orcamentoService'
import type { OrcamentoItemRequest } from '../../services/orcamentoService'
import { clienteService } from '../../services/clienteService'
import type { Cliente } from '../../types'

interface ItemRow { descricao: string; quantidade: string; valorUnit: string }
const EMPTY_ITEM: ItemRow = { descricao: '', quantidade: '1', valorUnit: '' }

export default function OrcamentoFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editando = Boolean(id)

  const [clienteId, setClienteId] = useState('')
  const [validadeDias, setValidadeDias] = useState('7')
  const [observacoes, setObservacoes] = useState('')
  const [itens, setItens] = useState<ItemRow[]>([{ ...EMPTY_ITEM }])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    clienteService.listar({ size: 200 }).then((p) => setClientes(p.content))
  }, [])

  useEffect(() => {
    if (!id) return
    orcamentoService.buscar(id).then((o) => {
      setClienteId(o.clienteId ?? '')
      setValidadeDias(o.validadeDias.toString())
      setObservacoes(o.observacoes ?? '')
      setItens(
        o.itens.length
          ? o.itens.map((i) => ({
              descricao: i.descricao,
              quantidade: i.quantidade.toString(),
              valorUnit: i.valorUnit.toString(),
            }))
          : [{ ...EMPTY_ITEM }]
      )
    })
  }, [id])

  function setItem(idx: number, field: keyof ItemRow, value: string) {
    setItens((prev) => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row))
  }

  function addItem() { setItens((prev) => [...prev, { ...EMPTY_ITEM }]) }

  function removeItem(idx: number) {
    setItens((prev) => prev.filter((_, i) => i !== idx))
  }

  const total = itens.reduce((acc, row) => {
    const q = parseFloat(row.quantidade) || 0
    const v = parseFloat(row.valorUnit) || 0
    return acc + q * v
  }, 0)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(''); setCarregando(true)
    try {
      const payload = {
        clienteId: clienteId || undefined,
        validadeDias: parseInt(validadeDias) || 7,
        observacoes: observacoes || undefined,
        itens: itens.map<OrcamentoItemRequest>((row) => ({
          descricao: row.descricao,
          quantidade: parseFloat(row.quantidade),
          valorUnit: parseFloat(row.valorUnit),
        })),
      }
      if (editando && id) {
        await orcamentoService.atualizar(id, payload)
      } else {
        await orcamentoService.criar(payload)
      }
      navigate('/orcamentos')
    } catch (err: unknown) {
      setErro((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro ao salvar orçamento.')
    } finally { setCarregando(false) }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/orcamentos" className="text-gray-400 hover:text-gray-600">← Orçamentos</Link>
        <h1 className="text-2xl font-bold text-gray-800">{editando ? 'Editar orçamento' : 'Novo orçamento'}</h1>
      </div>

      <div className="card">
        {erro && <div className="mb-4 rounded-md bg-red-50 border border-red-300 px-4 py-3 text-sm text-red-700">{erro}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Cliente</label>
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="input-field">
                <option value="">Selecione (opcional)...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Validade (dias) *</label>
              <input
                required type="number" min="1" value={validadeDias}
                onChange={(e) => setValidadeDias(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Itens */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Itens *</label>
              <button type="button" onClick={addItem} className="text-sm text-primary-600 hover:underline">+ Adicionar item</button>
            </div>
            <div className="space-y-2">
              {itens.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    required
                    placeholder="Descrição"
                    value={row.descricao}
                    onChange={(e) => setItem(idx, 'descricao', e.target.value)}
                    className="input-field col-span-6"
                  />
                  <input
                    required type="number" min="0.01" step="0.01" placeholder="Qtd"
                    value={row.quantidade}
                    onChange={(e) => setItem(idx, 'quantidade', e.target.value)}
                    className="input-field col-span-2"
                  />
                  <input
                    required type="number" min="0.01" step="0.01" placeholder="Valor unit."
                    value={row.valorUnit}
                    onChange={(e) => setItem(idx, 'valorUnit', e.target.value)}
                    className="input-field col-span-3"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={itens.length === 1}
                    className="col-span-1 text-red-400 hover:text-red-600 disabled:opacity-30 text-lg leading-none"
                  >×</button>
                </div>
              ))}
            </div>
            <div className="mt-2 text-right text-sm font-semibold text-gray-700">
              Total: R$ {total.toFixed(2)}
            </div>
          </div>

          <div>
            <label className="label">Observações</label>
            <textarea
              rows={2} value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="input-field resize-none"
              placeholder="Condições, prazo de execução..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={carregando} className="btn-primary">
              {carregando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Criar orçamento'}
            </button>
            <Link to="/orcamentos" className="btn-secondary">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
