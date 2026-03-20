import { useEffect, useState } from 'react'

export function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [on, setOn] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    if (!mq.matches) return undefined

    const move = (e) => {
      setPos({ x: e.clientX, y: e.clientY })
      setOn(true)
    }
    const leave = () => setOn(false)
    window.addEventListener('pointermove', move)
    document.body.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.body.removeEventListener('pointerleave', leave)
    }
  }, [])

  if (!on) return null
  return (
    <div
      className="custom-cursor"
      style={{ left: pos.x, top: pos.y }}
      aria-hidden
    >
      💜
    </div>
  )
}
