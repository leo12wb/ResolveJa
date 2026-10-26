import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Prestador {
  id: string
  nome: string
  email: string
}

interface AuthState {
  token: string | null
  prestador: Prestador | null
  login: (token: string, prestador: Prestador) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      prestador: null,
      login: (token, prestador) => set({ token, prestador }),
      logout: () => set({ token: null, prestador: null }),
    }),
    {
      name: 'resolveja-auth',
    }
  )
)
