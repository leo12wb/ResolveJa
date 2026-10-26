import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { orcamentoService } from '../../services/orcamentoService'
import { badgeOrcamento, labelOrcamento } from '../../utils/badges'
import type { Orcamento } from '../../types'

export default function OrcamentoDetalhePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (id) orcamentoService.buscar(id).then(setOrcamento)
  }, [id])

  async function handleStatus(status: 'ENVIADO' | 'CANCELADO') {
    if (!id) return
    const updated = await orcamentoService.atualizarStatus(id, status)
    setOrcamento(updated)
  }

  function copiarLink() {
    if (!orcamento) return
    const url = `${window.location.origin}/orcamento/${orcamento.tokenPublico}`
    navigator.clipboard.writeText(url)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (!orcamento) return <div className="p-8 text-center text-gray-400">Carregando...</div>

  const podeEnviar = orcamento.status === 'RASCUNHO'
  const podeCancelar = orcamento.status === 'ENVIADO'
  const linkAtivo = orcamento.status === 'ENVIADO' || orcamento.status === 'APROVADO'

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/orcamentos" className="text-gray-400 hover:text-gray-600">← Orçamentos</Link>
        <h1 className="text-2xl font-bold text-gray-800">Orçamento</h1>
        <span className={badgeOrcamento(orcamento.status)}>{labelOrcamento(orcamento.status)}</span>
      </div>

      <div className="card space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Cliente</span>
            <p className="font-medium text-gray-800">{orcamento.clienteNome ?? '—'}</p>
          </div>
          <div>
            <span className="text-gray-500">Válido até</span>
            <p className="font-medium text-gray-800">{orcamento.validadeData}</p>
          </div>
          <div>
            <span className="text-gray-500">Código público</span>
            <p className="font-mono text-gray-800 tracking-widest">{orcamento.tokenPublico}</p>
          </div>
          <div>
            <span className="text-gray-500">Criado em</span>
            <p className="font-medium text-gray-800">{new Date(orcamento.criadoEm).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {orcamento.observacoes && (
          <div>
            <span className="text-sm text-gray-500">Observações</span>
            <p className="text-sm text-gray-700 mt-1">{orcamento.observacoes}</p>
          </div>
        )}

        {/* Itens */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Itens</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Descrição</th>
                <th className="pb-2 font-medium text-right">Qtd</th>
                <th className="pb-2 font-medium text-right">Unit.</th>
                <th className="pb-2 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orcamento.itens.map((item, idx) => (
                <tr key={item.id ?? idx}>
                  <td className="py-2 text-gray-800">{item.descricao}</td>
                  <td className="py-2 text-right text-gray-600">{item.quantidade}</td>
                  <td className="py-2 text-right text-gray-600">R$ {Number(item.valorUnit).toFixed(2)}</td>
                  <td className="py-2 text-right font-medium text-gray-800">
                    R$ {(Number(item.quantidade) * Number(item.valorUnit)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200">
                <td colSpan={3} className="pt-2 text-right font-semibold text-gray-700">Total</td>
                <td className="pt-2 text-right font-bold text-gray-900">R$ {Number(orcamento.total).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
          {podeEnviar && (
            <button onClick={() => handleStatus('ENVIADO')} className="btn-primary">
              Enviar para cliente
            </button>
          )}
          {podeEnviar && (
            <button onClick={() => navigate(`/orcamentos/${id}/editar`)} className="btn-secondary">
              Editar
            </button>
          )}
          {linkAtivo && (
            <button onClick={copiarLink} className="btn-secondary">
              {copiado ? 'Link copiado!' : 'Copiar link público'}
            </button>
          )}
          {podeCancelar && (
            <button onClick={() => handleStatus('CANCELADO' as never)} className="text-sm text-red-600 hover:underline">
              Cancelar orçamento
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
