import { useEffect, useRef } from 'react'

// 2D 像素星空背景：彩色像素点向下漂移 + 闪烁
export default function PixelBackground() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const colors = ['#39ff14', '#00e5ff', '#ff2d95', '#bc13fe', '#fff720']
    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.floor(Math.random() * 2) + 1,
      speed: Math.random() * 0.25 + 0.08,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))

    let w = 0
    let h = 0
    let raf = 0

    function resize() {
      w = canvas!.width = window.innerWidth
      h = canvas!.height = window.innerHeight
    }

    function tick() {
      ctx!.clearRect(0, 0, w, h)
      for (const s of stars) {
        s.y += s.speed * 0.02
        if (s.y > 1) {
          s.y = 0
          s.x = Math.random()
        }
        const twinkle = 0.5 + (Math.sin(Date.now() * 0.004 + s.x * 20) + 1) * 0.25
        ctx!.globalAlpha = twinkle
        ctx!.fillStyle = s.color
        ctx!.fillRect(s.x * w, s.y * h, s.size, s.size)
      }
      ctx!.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }

    resize()
    tick()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0 h-full w-full" />
}
