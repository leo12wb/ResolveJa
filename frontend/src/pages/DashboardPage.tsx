import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardService } from '../services/dashboardService'
import { useAuthStore } from '../store/authStore'
import type { DashboardData } from '../types'

function fmtBRL(v: number | undefined | null): string {
  if (v == null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v))
}

function fmtHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

const STATUS_AG_COLOR: Record<string, string> = {
  AGENDADO: 'bg-blue-100 text-blue-700',
  REALIZADO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-gray-100 text-gray-500',
}

export default function DashboardPage() {
  const prestador = useAuthStore((s) => s.prestador)
  const [data, setData] = useState<DashboardData | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    dashboardService.carregar()
      .then(setData)
      .finally(() => setCarregando(false))
  }, [])

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  if (carregando) {
    return <div className="p-8 text-center text-gray-400">Carregando dashboard...</div>
  }

  const kpis = [
    {
      label: 'Serviços em andamento',
      value: data?.servicosEmAndamento ?? 0,
      cor: 'text-blue-700',
      bg: 'bg-blue-50',
      link: '/servicos',
    },
    {
      label: 'Orçamentos aguardando',
      value: data?.orcamentosAguardando ?? 0,
      cor: 'text-orange-700',
      bg: 'bg-orange-50',
      link: '/orcamentos',
    },
    {
      label: 'Clientes ativos',
      value: data?.totalClientesAtivos ?? 0,
      cor: 'text-primary-700',
      bg: 'bg-primary-50',
      link: '/clientes',
    },
    {
      label: 'Receitas do mês',
      value: fmtBRL(data?.resumoMes?.totalReceitas as number),
      cor: 'text-green-700',
      bg: 'bg-green-50',
      link: '/financeiro',
      isText: true,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {saudacao}, {prestador?.nome?.split(' ')[0]}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Link key={kpi.label} to={kpi.link} className={`card ${kpi.bg} border-0 hover:opacity-90 transition-opacity`}>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{kpi.label}</p>
            <p className={`text-2xl font-bold mt-1 ${kpi.cor}`}>
              {kpi.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Próximos agendamentos */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Próximos agendamentos</h2>
            <Link to="/agenda" className="text-xs text-primary-600 hover:underline">Ver agenda →</Link>
          </div>
          {!data?.proximosAgendamentos?.length ? (
            <p className="text-sm text-gray-400">Nenhum agendamento próximo.</p>
          ) : (
            <ul className="space-y-2">
              {data.proximosAgendamentos.map((ag) => (
                <li key={ag.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className={`mt-0.5 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_AG_COLOR[ag.status]}`}>
                    {fmtHora(ag.dataHora)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {ag.clienteNome ?? 'Sem cliente'}
                    </p>
                    {ag.descricao && (
                      <p className="text-xs text-gray-500 truncate">{ag.descricao}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Resumo financeiro + Alertas */}
        <div className="space-y-4">
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">Financeiro do mês</h2>
              <Link to="/financeiro" className="text-xs text-primary-600 hover:underline">Ver detalhes →</Link>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Receitas', value: data?.resumoMes?.totalReceitas, cor: 'text-green-700' },
                { label: 'Despesas', value: data?.resumoMes?.totalDespesas, cor: 'text-red-600' },
                { label: 'Resultado líquido', value: data?.resumoMes?.resultadoLiquido, cor: 'text-gray-800' },
                { label: 'A receber', value: data?.resumoMes?.totalAReceber, cor: 'text-blue-700' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{item.label}</span>
                  <span className={`font-semibold ${item.cor}`}>{fmtBRL(item.value as number)}</span>
                </div>
              ))}
            </div>
          </div>

          {data?.alertas && data.alertas.length > 0 && (
            <div className="card border-l-4 border-amber-400 bg-amber-50 space-y-2">
              <h2 className="text-sm font-semibold text-amber-800">Alertas</h2>
              <ul className="space-y-1">
                {data.alertas.map((alerta, i) => (
                  <li key={i} className="text-xs text-amber-700">{alerta}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
