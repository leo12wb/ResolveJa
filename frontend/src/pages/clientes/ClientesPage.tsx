import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clienteService } from '../../services/clienteService'
import { useDebounce } from '../../hooks/useDebounce'
import type { Cliente, Page } from '../../types'

export default function ClientesPage() {
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const termoBuscado = useDebounce(busca, 400)
  const [pagina, setPagina] = useState(0)
  const [dados, setDados] = useState<Page<Cliente> | null>(null)
  const [carregando, setCarregando] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await clienteService.listar({ q: termoBuscado || undefined, page: pagina, size: 20 })
      setDados(res)
    } catch {
      // erro silencioso — Axios interceptor trata 401
    } finally {
      setCarregando(false)
    }
  }, [termoBuscado, pagina])

  useEffect(() => { setPagina(0) }, [termoBuscado])
  useEffect(() => { carregar() }, [carregar])

  async function handleDesativar(id: string, nome: string) {
    if (!confirm(`Desativar o cliente "${nome}"?`)) return
    await clienteService.desativar(id)
    carregar()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
        <Link to="/clientes/novo" className="btn-primary">+ Novo cliente</Link>
      </div>

      {/* Busca */}
      <div className="card">
        <input
          type="search"
          placeholder="Buscar por nome ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="input-field max-w-sm"
        />
      </div>

      {/* Tabela */}
      <div className="card p-0 overflow-x-auto">
        {carregando ? (
          <div className="p-8 text-center text-gray-400">Carregando...</div>
        ) : !dados?.content.length ? (
          <div className="p-8 text-center text-gray-400">
            {busca ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Nome', 'Telefone', 'E-mail', 'Ações'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {dados.content.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.nome}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.telefone ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.email ?? '—'}</td>
                  <td className="px-4 py-3 text-sm flex gap-2">
                    <button onClick={() => navigate(`/clientes/${c.id}`)} className="text-primary-600 hover:underline">Ver</button>
                    <button onClick={() => navigate(`/clientes/${c.id}/editar`)} className="text-gray-500 hover:underline">Editar</button>
                    <button onClick={() => handleDesativar(c.id, c.nome)} className="text-red-500 hover:underline">Desativar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Paginação */}
        {dados && dados.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
            <span>{dados.totalElements} clientes</span>
            <div className="flex gap-2">
              <button onClick={() => setPagina((p) => p - 1)} disabled={pagina === 0} className="btn-secondary py-1 px-3 disabled:opacity-40">
                Anterior
              </button>
              <span className="py-1 px-3">{pagina + 1} / {dados.totalPages}</span>
              <button onClick={() => setPagina((p) => p + 1)} disabled={pagina >= dados.totalPages - 1} className="btn-secondary py-1 px-3 disabled:opacity-40">
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
