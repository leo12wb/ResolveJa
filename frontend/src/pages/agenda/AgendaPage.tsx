import { useState, useEffect, useRef, FormEvent } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'
import type { EventClickArg, DatesSetArg, EventInput } from '@fullcalendar/core'
import { agendamentoService } from '../../services/agendamentoService'
import type { AgendamentoRequest } from '../../services/agendamentoService'
import { clienteService } from '../../services/clienteService'
import type { Agendamento, Cliente, StatusAgendamento } from '../../types'

// Converte "2026-10-26T14:00" (local datetime-local input) → ISO UTC string
function localToISO(local: string): string {
  return new Date(local).toISOString()
}

// Converte ISO UTC string → "2026-10-26T14:00" (datetime-local input value)
function isoToLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const STATUS_COLOR: Record<string, string> = {
  AGENDADO:  '#3b82f6',
  REALIZADO: '#22c55e',
  CANCELADO: '#9ca3af',
}

interface ModalState {
  mode: 'create' | 'edit'
  agendamento?: Agendamento
  defaultStart?: string  // ISO UTC
}

const EMPTY_FORM: AgendamentoRequest = {
  clienteId: undefined,
  dataHora: '',
  duracaoMin: 60,
  descricao: '',
}

export default function AgendaPage() {
  const calendarRef = useRef<InstanceType<typeof FullCalendar>>(null)
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [modal, setModal] = useState<ModalState | null>(null)
  const [form, setForm] = useState<AgendamentoRequest>(EMPTY_FORM)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [range, setRange] = useState<{ inicio: string; fim: string } | null>(null)

  useEffect(() => {
    clienteService.listar({ size: 200 }).then((p) => setClientes(p.content))
  }, [])

  useEffect(() => {
    if (!range) return
    agendamentoService.listar(range).then(setAgendamentos)
  }, [range])

  function handleDatesSet(arg: DatesSetArg) {
    setRange({
      inicio: arg.startStr,
      fim: arg.endStr,
    })
  }

  function handleDateClick(arg: DateClickArg) {
    setModal({ mode: 'create', defaultStart: arg.date.toISOString() })
    setForm({ ...EMPTY_FORM, dataHora: arg.date.toISOString() })
    setErro('')
  }

  function handleEventClick(arg: EventClickArg) {
    const id = arg.event.id
    const found = agendamentos.find((a) => a.id === id)
    if (!found) return
    setModal({ mode: 'edit', agendamento: found })
    setForm({
      clienteId: found.clienteId,
      dataHora: found.dataHora,
      duracaoMin: found.duracaoMin,
      descricao: found.descricao ?? '',
    })
    setErro('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(''); setSalvando(true)
    try {
      if (modal?.mode === 'edit' && modal.agendamento) {
        const updated = await agendamentoService.atualizar(modal.agendamento.id, form)
        setAgendamentos((prev) => prev.map((a) => a.id === updated.id ? updated : a))
      } else {
        const created = await agendamentoService.criar(form)
        setAgendamentos((prev) => [...prev, created])
      }
      setModal(null)
    } catch (err: unknown) {
      setErro((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro ao salvar.')
    } finally { setSalvando(false) }
  }

  async function handleStatus(status: StatusAgendamento) {
    if (!modal?.agendamento) return
    const updated = await agendamentoService.atualizarStatus(modal.agendamento.id, status)
    setAgendamentos((prev) => prev.map((a) => a.id === updated.id ? updated : a))
    setModal(null)
  }

  const events: EventInput[] = agendamentos.map((a) => ({
    id: a.id,
    title: a.clienteNome ? `${a.clienteNome}${a.descricao ? ' — ' + a.descricao : ''}` : (a.descricao ?? 'Agendamento'),
    start: a.dataHora,
    end: new Date(new Date(a.dataHora).getTime() + a.duracaoMin * 60000).toISOString(),
    color: STATUS_COLOR[a.status] ?? STATUS_COLOR.AGENDADO,
    textColor: '#fff',
  }))

  const agAtual = modal?.agendamento

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Agenda</h1>

      <div className="card p-0 overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          buttonText={{ today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia' }}
          locale="pt-br"
          firstDay={0}
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          allDaySlot={false}
          nowIndicator
          selectable
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          events={events}
          height="auto"
          contentHeight={620}
        />
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                {modal.mode === 'create' ? 'Novo agendamento' : 'Editar agendamento'}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{erro}</p>}

              <div>
                <label className="label">Cliente</label>
                <select
                  value={form.clienteId ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, clienteId: e.target.value || undefined }))}
                  className="input-field"
                >
                  <option value="">Selecione (opcional)...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Data e hora *</label>
                  <input
                    required
                    type="datetime-local"
                    value={isoToLocal(form.dataHora)}
                    onChange={(e) => setForm((f) => ({ ...f, dataHora: localToISO(e.target.value) }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Duração (min) *</label>
                  <input
                    required type="number" min="15" step="15"
                    value={form.duracaoMin}
                    onChange={(e) => setForm((f) => ({ ...f, duracaoMin: parseInt(e.target.value) || 60 }))}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="label">Descrição</label>
                <textarea
                  rows={2}
                  value={form.descricao ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                  className="input-field resize-none"
                  placeholder="Serviço a realizar..."
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={salvando} className="btn-primary flex-1">
                  {salvando ? 'Salvando...' : modal.mode === 'create' ? 'Agendar' : 'Salvar'}
                </button>
                {modal.mode === 'edit' && agAtual?.status === 'AGENDADO' && (
                  <button
                    type="button"
                    onClick={() => handleStatus('REALIZADO')}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                  >
                    Realizado
                  </button>
                )}
                {modal.mode === 'edit' && agAtual?.status !== 'CANCELADO' && (
                  <button
                    type="button"
                    onClick={() => handleStatus('CANCELADO')}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
