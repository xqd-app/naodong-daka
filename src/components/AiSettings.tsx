import { useState } from 'react'
import { AI_PRESETS, isAiReady, saveAiConfig } from '../utils/ai'
import type { AiConfig } from '../utils/ai'

export default function AiSettings({
  cfg,
  onSave,
}: {
  cfg: AiConfig
  onSave: (cfg: AiConfig) => void
}) {
  const [draft, setDraft] = useState<AiConfig>(cfg)
  const ready = isAiReady(cfg)

  function handleSave() {
    saveAiConfig(draft)
    onSave(draft)
  }

  return (
    <details className="pixel-panel p-4" style={{ borderColor: ready ? '#39ff14' : '#ff9f1a' }}>
      <summary className="cursor-pointer list-none text-xs text-white/70">
        ⚙ AI 设置 ·{' '}
        <span style={{ color: ready ? '#39ff14' : '#ff9f1a' }}>
          {ready ? `已配置（${cfg.model}）` : '未配置，当前使用本地规则'}
        </span>
      </summary>

      <div className="mt-3 space-y-2">
        <div className="flex flex-wrap gap-1">
          {AI_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  baseUrl: p.baseUrl || d.baseUrl,
                  model: p.model || d.model,
                }))
              }
              className="border border-white/15 px-2 py-1 text-[10px] text-white/50 hover:border-[#00e5ff] hover:text-[#00e5ff]"
            >
              {p.label}
            </button>
          ))}
        </div>

        <input
          value={draft.baseUrl}
          onChange={(e) => setDraft((d) => ({ ...d, baseUrl: e.target.value }))}
          placeholder="Base URL，例如 https://api.deepseek.com/v1"
          className="w-full border-2 border-white/20 bg-black/40 px-2 py-1.5 text-xs outline-none focus:border-[#00e5ff]"
        />
        <input
          value={draft.model}
          onChange={(e) => setDraft((d) => ({ ...d, model: e.target.value }))}
          placeholder="模型名，例如 deepseek-chat"
          className="w-full border-2 border-white/20 bg-black/40 px-2 py-1.5 text-xs outline-none focus:border-[#00e5ff]"
        />
        <input
          type="password"
          value={draft.apiKey}
          onChange={(e) => setDraft((d) => ({ ...d, apiKey: e.target.value }))}
          placeholder="API Key（仅保存在本机浏览器）"
          className="w-full border-2 border-white/20 bg-black/40 px-2 py-1.5 text-xs outline-none focus:border-[#00e5ff]"
        />

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="pixel-btn flex-1 px-3 py-1.5 text-xs"
            style={{ backgroundColor: '#39ff14', borderColor: '#39ff14', color: '#05050f' }}
          >
            保存配置
          </button>
          <button
            onClick={() => {
              const empty = { baseUrl: '', apiKey: '', model: '' }
              setDraft(empty)
              saveAiConfig(empty)
              onSave(empty)
            }}
            className="pixel-btn px-3 py-1.5 text-xs"
            style={{ backgroundColor: 'transparent', borderColor: '#ff2d95', color: '#ff2d95' }}
          >
            清除
          </button>
        </div>

        <p className="text-[10px] leading-relaxed text-white/30">
          Key 只写入本机 localStorage，不会上传到任何第三方。若请求报 CORS 错误，说明该服务不允许浏览器直连，
          需要换用支持跨域的服务或自建代理。
        </p>
      </div>
    </details>
  )
}
