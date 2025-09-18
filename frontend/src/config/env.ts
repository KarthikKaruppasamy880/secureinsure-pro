export const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/,'') || 'http://localhost:8082';
export const VOICE_ENABLED = String(import.meta.env.VITE_VOICE_ENABLED ?? 'false') === 'true';
export const WS_URL = import.meta.env.VITE_WS_URL || `${API_BASE.replace(/^http/,'ws')}/ws`;