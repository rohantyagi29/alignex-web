const KEY = 'alignex_id_token'

export const getToken = () => {
  try { return localStorage.getItem(KEY) } catch { return null }
}
export const setToken = (t) => {
  try { localStorage.setItem(KEY, t) } catch {}
}
export const clearToken = () => {
  try { localStorage.removeItem(KEY) } catch {}
}
export const isTokenValid = () => {
  const t = getToken()
  if (!t) return false
  try {
    const payload = JSON.parse(atob(t.split('.')[1]))
    return payload.exp * 1000 > Date.now() + 30000
  } catch { return false }
}
export const getTokenEmail = () => {
  const t = getToken()
  if (!t) return null
  try { return JSON.parse(atob(t.split('.')[1])).email || null } catch { return null }
}
