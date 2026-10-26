import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { clienteService } from '../../services/clienteService'
import type { Cliente } from '../../types'

export default function ClienteDetalhePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!id) return
    clienteService.buscar(id)
      .then(setCliente)
      .catch(() => navigate('/clientes'))
      .finally(() => setCarregando(false))
  }, [id, navigate])

  if (carregando) return <div className="text-center py-12 text-gray-400">Carregando...</div>
  if (!cliente) return null

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/clientes" className="text-gray-400 hover:text-gray-600">← Clientes</Link>
          <h1 className="text-2xl font-bold text-gray-800">{cliente.nome}</h1>
          {!cliente.ativo && (
            <span className="badge-status bg-gray-100 text-gray-500">Inativo</span>
          )}
        </div>
        <Link to={`/clientes/${id}/editar`} className="btn-secondary">Editar</Link>
      </div>

      {/* Dados do cliente */}
      <div className="card grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-400 uppercase font-medium">Telefone</p>
          <p className="text-gray-800 mt-1">{cliente.telefone ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase font-medium">E-mail</p>
          <p className="text-gray-800 mt-1">{cliente.email ?? '—'}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs text-gray-400 uppercase font-medium">Endereço</p>
          <p className="text-gray-800 mt-1">{cliente.endereco ?? '—'}</p>
        </div>
        {cliente.observacoes && (
          <div className="sm:col-span-2">
            <p className="text-xs text-gray-400 uppercase font-medium">Observações</p>
            <p className="text-gray-700 mt-1 text-sm whitespace-pre-wrap">{cliente.observacoes}</p>
          </div>
        )}
      </div>

      {/* Ações rápidas */}
      <div className="flex flex-wrap gap-3">
        <Link to={`/servicos/novo?clienteId=${id}&clienteNome=${encodeURIComponent(cliente.nome)}`} className="btn-primary">
          + Novo serviço
        </Link>
        <Link to={`/orcamentos/novo?clienteId=${id}&clienteNome=${encodeURIComponent(cliente.nome)}`} className="btn-secondary">
          + Novo orçamento
        </Link>
        <Link to={`/agenda?clienteId=${id}`} className="btn-secondary">
          + Agendar
        </Link>
      </div>

      {/* Histórico — placeholder para Fase 3 completa */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Histórico</h2>
        <p className="text-sm text-gray-400">Serviços, orçamentos e agendamentos aparecerão aqui.</p>
      </div>
    </div>
  )
}
