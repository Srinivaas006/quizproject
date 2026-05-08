import { useEffect } from 'react'

const BACKEND = process.env.REACT_APP_BACKEND_URL || 'https://quizproject-backend.onrender.com'

export default function useKeepAlive() {
  useEffect(() => {
    const ping = () => {
      fetch(`${BACKEND}/health`).catch(() => {})
    }

    ping() // ping immediately on load
    const interval = setInterval(ping, 10 * 60 * 1000) // every 10 minutes
    return () => clearInterval(interval)
  }, [])
}