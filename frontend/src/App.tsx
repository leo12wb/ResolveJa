import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Layouts
import AppLayout from './components/layout/AppLayout'

// Auth pages (public)
import LoginPage from './pages/auth/LoginPage'
import RegistroPage from './pages/auth/RegistroPage'
import RecuperarSenhaPage from './pages/auth/RecuperarSenhaPage'
import RedefinirSenhaPage from './pages/auth/RedefinirSenhaPage'

// Public pages
import OrcamentoPublicoPage from './pages/public/OrcamentoPublicoPage'
import PrivacidadePage from './pages/legal/PrivacidadePage'
import TermosPage from './pages/legal/TermosPage'

// Protected pages
import DashboardPage from './pages/DashboardPage'
import ClientesPage from './pages/clientes/ClientesPage'
import ClienteFormPage from './pages/clientes/ClienteFormPage'
import ClienteDetalhePage from './pages/clientes/ClienteDetalhePage'
import ServicosPage from './pages/servicos/ServicosPage'
import ServicoFormPage from './pages/servicos/ServicoFormPage'
import OrcamentosPage from './pages/orcamentos/OrcamentosPage'
import OrcamentoFormPage from './pages/orcamentos/OrcamentoFormPage'
import OrcamentoDetalhePage from './pages/orcamentos/OrcamentoDetalhePage'
import AgendaPage from './pages/agenda/AgendaPage'
import FinanceiroPage from './pages/financeiro/FinanceiroPage'
import NotificacoesPage from './pages/NotificacoesPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
        <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />
        <Route path="/orcamento/:token" element={<OrcamentoPublicoPage />} />
        <Route path="/privacidade" element={<PrivacidadePage />} />
        <Route path="/termos" element={<TermosPage />} />

        {/* Rotas protegidas */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="clientes/novo" element={<ClienteFormPage />} />
          <Route path="clientes/:id/editar" element={<ClienteFormPage />} />
          <Route path="clientes/:id" element={<ClienteDetalhePage />} />
          <Route path="servicos" element={<ServicosPage />} />
          <Route path="servicos/novo" element={<ServicoFormPage />} />
          <Route path="servicos/:id/editar" element={<ServicoFormPage />} />
          <Route path="orcamentos" element={<OrcamentosPage />} />
          <Route path="orcamentos/novo" element={<OrcamentoFormPage />} />
          <Route path="orcamentos/:id/editar" element={<OrcamentoFormPage />} />
          <Route path="orcamentos/:id" element={<OrcamentoDetalhePage />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="financeiro" element={<FinanceiroPage />} />
          <Route path="notificacoes" element={<NotificacoesPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
