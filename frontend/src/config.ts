export const config = {
  apiUrl: (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api',
} as const;