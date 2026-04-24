import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'error') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', pointerEvents: 'none' }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: '#0f172a',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 500,
              boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              animation: 'slideUp 0.25s ease',
              pointerEvents: 'all',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: 16 }}>{t.type === 'error' ? '✕' : '✓'}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
