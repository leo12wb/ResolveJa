import api from './api'
import type { DashboardData } from '../types'

export const dashboardService = {
  carregar: () =>
    api.get<DashboardData>('/dashboard').then((r) => r.data),
}
