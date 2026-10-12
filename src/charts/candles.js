import { alignTimeSeries } from './timeSeries.js'

export const defaultPeriods = [5, 10, 20, 30]

export function movingAverage(values, period, digit = 2) {
  let sum = 0
  let missing = 0
  return values.map((value, index) => {
    if (value == null) missing++
    else sum += value
    if (index >= period) {
      const previous = values[index - period]
      if (previous == null) missing--
      else sum -= previous
    }
    // Match the existing v-charts warmup: the first MA is at index `period`.
    return index < period || missing ? null : Number((sum / period).toFixed(digit))
  })
}

export function alignCandles(rows, settings) {
  const data = alignTimeSeries(rows, settings.metrics)
  if (settings.showMA) {
    for (const period of settings.MA || defaultPeriods) {
      data.push(movingAverage(data[2], period, settings.digit))
    }
  }
  return data
}

export function candleBounds(data) {
  const times = data[0]
  if (!times.length) return null
  const last = times.length - 1
  const left = last ? (times[1] - times[0]) / 2 : 12 * 60 * 60
  const right = last ? (times[last] - times[last - 1]) / 2 : left
  return { min: times[0] - left, max: times[last] + right }
}

// OHLC columns contribute to auto-ranging and the legend, but their paths are
// drawn together here. All coordinates are in canvas pixels (including HiDPI).
export function drawCandles(plot, settings, pixelRatio) {
  const [times, opens, closes, lows, highs] = plot.data
  const { ctx, bbox } = plot
  const first = Math.max(0, plot.posToIdx(0) - 1)
  const last = Math.min(times.length - 1, plot.posToIdx(bbox.width, true) + 1)
  ctx.save()
  ctx.beginPath()
  ctx.rect(bbox.left, bbox.top, bbox.width, bbox.height)
  ctx.clip()
  ctx.lineWidth = pixelRatio
  for (let index = first; index <= last; index++) {
    const open = opens[index]
    const close = closes[index]
    const low = lows[index]
    const high = highs[index]
    if ([open, close, low, high].some(value => value == null)) continue
    const x = plot.valToPos(times[index], 'x', true)
    const yOpen = plot.valToPos(open, 'y', true)
    const yClose = plot.valToPos(close, 'y', true)
    let spacing = 20 * pixelRatio
    if (index > 0) spacing = Math.min(spacing, x - plot.valToPos(times[index - 1], 'x', true))
    if (index < times.length - 1) spacing = Math.min(spacing, plot.valToPos(times[index + 1], 'x', true) - x)
    const width = Math.max(pixelRatio, Math.min(12 * pixelRatio, spacing * 0.6))
    const color = close >= open ? settings.upColor : settings.downColor
    ctx.strokeStyle = ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x, plot.valToPos(high, 'y', true))
    ctx.lineTo(x, plot.valToPos(low, 'y', true))
    ctx.stroke()
    ctx.fillRect(x - width / 2, Math.min(yOpen, yClose), width, Math.max(pixelRatio, Math.abs(yOpen - yClose)))
  }
  ctx.restore()
}
