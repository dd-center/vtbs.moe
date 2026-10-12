const DAY = 24 * 60 * 60

const pad = value => String(value).padStart(2, '0')
const trim = text => text.includes('.') ? text.replace(/\.?0+$/, '') : text

// Tick labels for one axis: one unit for the whole axis, with just enough
// decimals that neighbouring ticks never read the same (187.12万, 187.13万).
export function compactTicks(splits) {
  const finite = splits.filter(Number.isFinite)
  if (!finite.length) return splits.map(() => '')
  const largest = Math.max(...finite.map(Math.abs))
  const [unit, suffix] = largest >= 1e8 ? [1e8, '亿'] : largest >= 1e4 ? [1e4, '万'] : [1, '']
  const step = finite.length > 1 ? Math.abs(finite[1] - finite[0]) / unit : 1
  const digits = Math.min(4, Math.max(unit === 1 ? 0 : 1, Math.ceil(-Math.log10(step) - 1e-9)))
  return splits.map(value => Number.isFinite(value) ? `${trim(value === 0 ? '0' : (value / unit).toFixed(digits))}${value === 0 ? '' : suffix}` : '')
}

export function fullNumber(value) {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

export function formatDate(seconds) {
  const date = new Date(seconds * 1000)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function formatTime(seconds, dateOnly = false) {
  if (dateOnly) return formatDate(seconds)
  const date = new Date(seconds * 1000)
  return `${formatDate(seconds)} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// uPlot axis `values` callback. `increment` is the tick spacing in seconds;
// the date is repeated only where the day (or year) actually changes.
export function timeTicks(_, splits, __, ___, increment) {
  let previous = null
  return splits.map(seconds => {
    const date = new Date(seconds * 1000)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = `${month}/${date.getDate()}`
    const last = previous
    previous = date
    if (increment >= 360 * DAY) return `${year}`
    if (increment >= 28 * DAY) return !last || last.getFullYear() !== year ? `${year}/${month}` : `${month}月`
    if (increment >= DAY) return !last || last.getFullYear() !== year ? `${year}/${day}` : day
    const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`
    return !last || last.toDateString() !== date.toDateString() ? `${day} ${time}` : time
  })
}

const presets = [
  { key: '6h', label: '6小时', span: DAY / 4 },
  { key: '1d', label: '1天', span: DAY },
  { key: '7d', label: '7天', span: 7 * DAY },
  { key: '30d', label: '30天', span: 30 * DAY },
  { key: '90d', label: '90天', span: 90 * DAY },
  { key: '1y', label: '1年', span: 365 * DAY },
]

// Offer at most three trailing windows shorter than the data (and long enough
// to hold a few points, e.g. no "30天" for weekly candles), then "all".
export function rangePresets(bounds, minimum = 0) {
  if (!bounds) return []
  const fits = presets.filter(preset => preset.span >= minimum && preset.span < (bounds.max - bounds.min) * 0.9)
  return [...fits.slice(-3), { key: 'all', label: '全部', span: null }]
}

export function activePreset(window, bounds, available) {
  if (!window || !bounds) return null
  const span = bounds.max - bounds.min
  const tolerance = span * 0.005
  if (Math.abs(window.max - bounds.max) > tolerance) return null
  return (available.find(preset => preset.span == null
    ? Math.abs(window.min - bounds.min) <= tolerance
    : Math.abs(window.max - window.min - preset.span) <= tolerance) || {}).key || null
}

export function alpha(hex, opacity) {
  const value = parseInt(hex.slice(1), 16)
  return `rgba(${value >> 16}, ${(value >> 8) & 255}, ${value & 255}, ${opacity})`
}
