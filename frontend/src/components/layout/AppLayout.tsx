import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { to: '/dashboard',   label: 'Dashboard',    icon: '📊' },
  { to: '/clientes',    label: 'Clientes',     icon: '👥' },
  { to: '/servicos',    label: 'Serviços',     icon: '🔧' },
  { to: '/orcamentos',  label: 'Orçamentos',   icon: '📋' },
  { to: '/agenda',      label: 'Agenda',       icon: '📅' },
  { to: '/financeiro',  label: 'Financeiro',   icon: '💰' },
]

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const prestador = useAuthStore((s) => s.prestador)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200
          md:relative md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-primary-700">⚡ ResolveJá</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 truncate mb-2">{prestador?.nome}</p>
          <button
            onClick={handleLogout}
            className="w-full btn-secondary text-xs"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar mobile */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
            aria-label="Abrir menu"
          >
            ☰
          </button>
          <span className="font-bold text-primary-700">⚡ ResolveJá</span>
          <NavLink to="/notificacoes" className="p-2 text-gray-500 hover:bg-gray-100 rounded-md">
            🔔
          </NavLink>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 py-3 border-t border-gray-100">
          <a href="/privacidade" className="hover:underline">Privacidade</a>
          {' · '}
          <a href="/termos" className="hover:underline">Termos</a>
        </footer>
      </div>
    </div>
  )
}
