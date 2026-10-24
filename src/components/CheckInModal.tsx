import { useRef, useState, type ChangeEvent } from 'react'
import type { CheckIn, CheckInLocation, Habit } from '../types'
import { useHabitStore } from '../stores/useHabitStore'
import { compressImage } from '../utils/image'
import { getCurrentPosition, reverseGeocode } from '../utils/geo'

interface Props {
  habit: Habit
  existing?: CheckIn
  date: string
  onClose: () => void
}

export default function CheckInModal({ habit, existing, date, onClose }: Props) {
  const checkIn = useHabitStore((s) => s.checkIn)
  const uncheck = useHabitStore((s) => s.uncheck)

  const [photo, setPhoto] = useState<string | undefined>(existing?.photo)
  const [location, setLocation] = useState<CheckInLocation | undefined>(existing?.location)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')
  const [shaking, setShaking] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      setError('')
      setPhoto(await compressImage(file))
    } catch {
      setError('照片处理失败，请重试')
    }
  }

  async function handleLocate() {
    setLocating(true)
    setError('')
    try {
      const { lat, lng } = await getCurrentPosition()
      const address = await reverseGeocode(lat, lng)
      setLocation({ lat, lng, address })
    } catch {
      setError('定位失败，请检查浏览器定位权限')
    } finally {
      setLocating(false)
    }
  }

  function handleConfirm() {
    checkIn(habit.id, date, { photo, location })
    setShaking(true)
    setTimeout(onClose, 260)
  }

  function handleUncheck() {
    uncheck(habit.id, date)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        className={`pixel-panel w-full max-w-md p-6 ${shaking ? 'shake' : ''}`}
        style={{ borderColor: habit.color }}
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="text-3xl">{habit.emoji}</span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-bold">{habit.name}</h2>
            <p className="font-pixel text-[10px] text-white/50">{date}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/80">
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="font-pixel mb-2 text-[10px] tracking-widest text-[#00e5ff]">▸ 拍照记录</p>
          {photo ? (
            <div className="relative overflow-hidden border-2 border-white/20">
              <img src={photo} alt="打卡照片" className="h-40 w-full object-cover" />
              <button
                onClick={() => setPhoto(undefined)}
                className="pixel-btn absolute right-2 top-2 px-2 py-1 text-xs"
                style={{ backgroundColor: '#000', borderColor: '#ff2d95', color: '#ff2d95' }}
              >
                移除
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex h-24 w-full items-center justify-center gap-2 border-2 border-dashed border-white/20 text-sm text-white/50 hover:border-white/40 hover:text-white/80"
            >
              📷 拍照 / 上传照片
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        <div className="mb-5">
          <p className="font-pixel mb-2 text-[10px] tracking-widest text-[#00e5ff]">▸ 记录地址</p>
          {location ? (
            <div className="flex items-center gap-2 border-2 border-white/10 bg-white/5 px-3 py-2 text-sm">
              <span>📍</span>
              <span className="min-w-0 flex-1 truncate">
                {location.address ??
                  `纬度 ${location.lat.toFixed(4)} · 经度 ${location.lng.toFixed(4)}`}
              </span>
              <button onClick={() => setLocation(undefined)} className="text-white/40 hover:text-white/80">
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={handleLocate}
              disabled={locating}
              className="flex h-12 w-full items-center justify-center gap-2 border-2 border-dashed border-white/20 text-sm text-white/50 hover:border-white/40 hover:text-white/80 disabled:opacity-50"
            >
              {locating ? '定位中…' : '📍 记录当前位置'}
            </button>
          )}
        </div>

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        <div className="flex gap-2">
          {existing && (
            <button
              onClick={handleUncheck}
              className="pixel-btn px-4 py-2 text-sm"
              style={{ backgroundColor: 'transparent', borderColor: '#ff2d95', color: '#ff2d95' }}
            >
              取消打卡
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="pixel-btn flex-1 px-4 py-2 text-sm"
            style={{ backgroundColor: habit.color, borderColor: habit.color, color: '#05050f' }}
          >
            {existing ? '保存记录' : '完成打卡'}
          </button>
        </div>
      </div>
    </div>
  )
}
