<template>
<div class="tsc" ref="root">
  <div class="tsc-toolbar">
    <span class="tsc-time" :class="{ hovering: hoverTime }">{{ hoverTime || rangeLabel }}<span class="tsc-loading" v-if="loading"><i class="el-icon-loading"></i> 加载中</span></span>
    <div class="tsc-presets" role="group" aria-label="时间范围" v-if="presets.length > 1">
      <button type="button" v-for="preset in presets" :key="preset.key" :class="{ active: preset.key === currentPreset }" :aria-pressed="String(preset.key === currentPreset)" @click="applyPreset(preset)">{{ preset.label }}</button>
    </div>
  </div>

  <div class="tsc-pane" v-for="(pane, paneIndex) in panes" :key="paneIndex">
    <div class="tsc-legend">
      <template v-if="pane.candle && ohlc">
        <span class="tsc-ohlc" v-for="field in ohlcFields" :key="field.key"><span class="tsc-label">{{ field.label }}</span><b>{{ ohlc[field.key] }}</b></span>
        <b class="tsc-change" :style="{ color: ohlc.color }">{{ ohlc.change }}</b>
      </template>
      <button type="button" class="tsc-key" v-for="item in pane.items" :key="item.key" :class="{ off: hidden[item.key] }" :aria-pressed="String(!hidden[item.key])" :title="hidden[item.key] ? '显示' : '隐藏'" @click="toggle(item)">
        <i class="tsc-swatch" :style="{ background: item.color }"></i><span class="tsc-label">{{ item.label }}</span><b>{{ readout[item.key] }}</b>
      </button>
    </div>
    <div class="tsc-plot" :ref="`pane${paneIndex}`" @dblclick="resetZoom" title="拖动以缩放，双击显示全部"></div>
  </div>

  <div class="tsc-nav" ref="nav" v-show="bounds" @pointerdown="navDown" @pointermove="navMove" @pointerup="navUp" @pointercancel="navUp" @dblclick.stop="resetZoom">
    <div class="tsc-nav-plot" ref="navPlot"></div>
    <div class="tsc-nav-missing" v-for="(gap, index) in navGaps" :key="index" :style="{ left: `${gap.left}px`, width: `${gap.width}px` }" title="未加载"></div>
    <div class="tsc-nav-shade" :style="{ left: 0, width: `${nav.left}px` }"></div>
    <div class="tsc-nav-shade" :style="{ left: `${nav.left + nav.width}px`, right: 0 }"></div>
    <div class="tsc-nav-window" tabindex="0" role="slider" aria-label="拖动以平移时间范围，方向键也可平移" :aria-valuetext="rangeLabel" :style="{ left: `${nav.left}px`, width: `${nav.width}px` }" @keydown="navKey" data-drag="pan">
      <span class="tsc-handle" data-drag="min"></span>
      <span class="tsc-handle" data-drag="max"></span>
    </div>
  </div>
</div>
</template>

<script>
import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'
import { alignTimeSeries, followWindow, clampWindow, timeBounds } from '@/charts/timeSeries'
import { alignCandles, candleBounds, defaultPeriods, drawCandles } from '@/charts/candles'
import { activePreset, alpha, compactTicks, formatTime, fullNumber, rangePresets, timeTicks } from '@/charts/format'

// Categorical slots in fixed order; colour follows the metric, not its pane.
const palette = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#6250d6']
const ink = { axis: '#8a8f98', grid: '#eef0f3', muted: '#9aa0a8' }
const AXIS_SIZE = 56
const RIGHT_PAD = 20
const NAV_HEIGHT = 40
const CANDLE_WINDOW = 120
let uid = 0

const ohlcFields = [
  { key: 'open', label: '开' },
  { key: 'high', label: '高' },
  { key: 'low', label: '低' },
  { key: 'close', label: '收' },
]

export default {
  props: {
    type: { type: String, default: 'line' },
    rows: { type: Array, required: true },
    settings: { type: Object, required: true },
    extend: { type: Object, default: () => ({}) },
    dataZoom: { type: Array, default: () => [] },
    // Full time domain (ms) when rows are only partly loaded; the navigator
    // and presets span it and `window` events ask the parent for more rows.
    extent: { type: Object, default: null },
    loadedRanges: { type: Array, default: null },
    loading: { type: Boolean, default: false },
  },
  data() {
    return {
      bounds: null,
      step: 0,
      window: null,
      hoverTime: '',
      readout: {},
      ohlc: null,
      hidden: {},
      nav: { left: 0, width: 0 },
      navGaps: [],
      compact: false,
    }
  },
  computed: {
    candle() {
      return this.type === 'candle'
    },
    // Two measures never share a y axis: each axisSite side becomes its own
    // pane, stacked over a shared, synchronised time axis.
    panes() {
      const settings = this.settings
      const labels = settings.labelMap || {}
      const names = settings.yAxisName || []
      if (this.candle) {
        const periods = settings.showMA ? settings.MA || defaultPeriods : []
        return [{
          candle: true,
          autoScale: true,
          columns: [...settings.metrics, ...periods.map(period => `MA${period}`)].map((_, index) => index),
          items: periods.map((period, index) => ({ key: `MA${period}`, label: `MA${period}`, column: settings.metrics.length + index, color: palette[index % palette.length] })),
        }]
      }
      const right = (settings.axisSite || {}).right || []
      return [0, 1].map(side => {
        const items = settings.metrics
          .map((metric, index) => ({ key: metric, label: labels[metric] || metric, column: index, color: palette[index % palette.length] }))
          .filter(item => right.includes(item.key) === !!side)
        // A lone series takes the axis name, which is usually more specific.
        if (items.length === 1 && names[side]) items[0].label = names[side]
        return { side, items, autoScale: !!(settings.scale || [])[side], columns: items.map(item => item.column) }
      }).filter(pane => pane.items.length)
    },
    presets() {
      return rangePresets(this.bounds, this.step * (this.candle ? 20 : 4))
    },
    currentPreset() {
      return activePreset(this.window, this.bounds, this.presets)
    },
    rangeLabel() {
      if (!this.window) return ''
      return `${formatTime(this.window.min, this.daily)} — ${formatTime(this.window.max, this.daily)}`
    },
    ohlcFields: () => ohlcFields,
  },
  created() {
    // Canvas instances must stay outside Vue's reactive object traversal.
    this.plots = []
    this.navPlot = null
    this.data = null
    this.frame = null
    this.drag = null
    this.applying = false
    this.daily = false
    this.syncKey = `tsc-${uid++}`
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(this.$refs.root)
    this.renderPlot()
  },
  beforeDestroy() {
    cancelAnimationFrame(this.frame)
    this.resizeObserver.disconnect()
    this.destroyPlots()
  },
  watch: {
    type: 'rebuild',
    // Socket handlers replace records or append/pop rows; avoid deep traversal.
    rows: 'scheduleUpdate',
    settings: { deep: true, handler: 'rebuild' },
    extend: { deep: true, handler: 'rebuild' },
    dataZoom: { deep: true, handler() { this.window = null; this.scheduleUpdate() } },
    extent: 'scheduleUpdate',
    loadedRanges: 'updateNav',
  },
  methods: {
    scheduleUpdate() {
      if (this.frame !== null) return
      this.frame = requestAnimationFrame(() => {
        this.frame = null
        this.renderPlot()
      })
    },
    rebuild() {
      this.destroyPlots()
      this.hidden = {}
      this.scheduleUpdate()
    },
    destroyPlots() {
      this.plots.forEach(plot => plot.destroy())
      this.plots = []
      if (this.navPlot) this.navPlot.destroy()
      this.navPlot = null
    },
    heights() {
      const scale = this.compact ? 0.75 : 1
      return (this.panes.length > 1 ? [230, 120] : [320]).map(height => Math.round(height * scale))
    },
    width() {
      return Math.max(1, Math.floor(this.$refs.root.clientWidth))
    },
    resize() {
      const width = this.width()
      this.compact = width < 560
      const heights = this.heights()
      this.plots.forEach((plot, index) => plot.setSize({ width, height: heights[index] }))
      if (this.navPlot) this.navPlot.setSize({ width: this.navWidth(), height: NAV_HEIGHT })
      this.updateNav()
    },
    navWidth() {
      return Math.max(1, this.width() - AXIS_SIZE - RIGHT_PAD)
    },
    renderPlot() {
      const data = this.candle ? alignCandles(this.rows, this.settings) : alignTimeSeries(this.rows, this.settings.metrics)
      const previous = this.bounds
      let bounds = this.candle ? candleBounds(data) : timeBounds(data)
      if (this.extent) {
        const min = this.extent.min / 1000
        const max = this.extent.max / 1000
        bounds = bounds ? { min: Math.min(bounds.min, min), max: Math.max(bounds.max, max) } : { min, max }
      }
      this.data = data
      const times = data[0]
      this.step = times.length > 1 ? (times[times.length - 1] - times[0]) / (times.length - 1) : 0
      // Daily/weekly candles carry no meaningful time of day.
      this.daily = this.candle && this.step >= 20 * 60 * 60
      if (!this.plots.length) this.createPlots(data)
      else {
        this.plots.forEach((plot, index) => plot.setData(this.paneData(this.panes[index]), false))
        this.navPlot.setData(this.navData(), false)
      }
      this.bounds = bounds
      if (!bounds) {
        this.window = null
        this.updateReadout(null)
        return
      }
      this.navPlot.setScale('x', bounds)
      this.applyWindow(this.window ? followWindow(this.window, previous, bounds) : this.initialWindow(bounds))
    },
    initialWindow(bounds) {
      const zoom = this.dataZoom[0] || {}
      const span = bounds.max - bounds.min
      const ranged = this.candle && this.settings.showDataZoom
      if (ranged && this.settings.start == null && this.data[0].length > CANDLE_WINDOW) {
        // Thousands of daily candles collapse to 1px; open on the latest few months.
        const times = this.data[0]
        return { min: times[times.length - CANDLE_WINDOW] - this.step / 2, max: bounds.max }
      }
      const start = ranged ? (this.settings.start == null ? 50 : this.settings.start) : 0
      const end = ranged ? (this.settings.end == null ? 100 : this.settings.end) : 100
      return clampWindow({
        min: zoom.startValue == null ? bounds.min + span * start / 100 : zoom.startValue / 1000,
        max: zoom.endValue == null ? bounds.min + span * end / 100 : zoom.endValue / 1000,
      }, bounds)
    },
    paneData(pane) {
      return [this.data[0], ...pane.columns.map(column => this.data[column + 1])]
    },
    navData() {
      // The overview traces the first (or closing) series of the top pane.
      return [this.data[0], this.data[this.candle ? 2 : this.panes[0].columns[0] + 1]]
    },
    seriesFor(pane) {
      const labels = this.settings.labelMap || {}
      const single = pane.items.length === 1 && !pane.candle
      const bars = this.settings.bars || []
      return pane.columns.map(column => {
        const item = pane.items.find(entry => entry.column === column)
        if (!item) {
          // Raw OHLC columns: drawn as candles by the drawSeries hook, but kept
          // as series so they drive the y range.
          const metric = this.settings.metrics[column]
          return { label: labels[metric] || metric, scale: 'y', stroke: 'transparent', paths: () => null, points: { show: false } }
        }
        const step = this.extend[`series.${column}.step`] === 'end'
        const bar = bars.includes(item.key)
        return {
          label: item.label,
          scale: 'y',
          show: !this.hidden[item.key],
          stroke: item.color,
          width: pane.candle ? 1.25 : 1.75,
          fill: bar ? alpha(item.color, 0.55) : single ? (plot, seriesIndex) => this.gradient(plot, item.color) : undefined,
          paths: bar ? uPlot.paths.bars({ size: [0.7, 24, 2], gap: 1 }) : step ? uPlot.paths.stepped({ align: 1 }) : uPlot.paths.linear(),
          points: bar ? { show: false } : { size: 7, width: 2, fill: '#fff' },
        }
      })
    },
    gradient(plot, color) {
      const { top, height } = plot.bbox
      if (!height) return alpha(color, 0.1)
      const fill = plot.ctx.createLinearGradient(0, top, 0, top + height)
      fill.addColorStop(0, alpha(color, 0.18))
      fill.addColorStop(1, alpha(color, 0))
      return fill
    },
    createPlots() {
      const width = this.width()
      this.compact = width < 560
      const heights = this.heights()
      const font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
      this.applying = true
      this.plots = this.panes.map((pane, index) => {
        const bottom = index === this.panes.length - 1
        const autoScale = pane.autoScale
        const opts = {
          width,
          height: heights[index],
          padding: [10, RIGHT_PAD, bottom ? 0 : 4, 0],
          legend: { show: false },
          cursor: {
            y: false,
            sync: { key: this.syncKey, setSeries: false },
            drag: { x: true, y: false, setScale: true },
            points: { size: 7, width: 2, fill: '#fff' },
          },
          scales: {
            x: { time: true },
            y: {
              range: (_, min, max) => {
                if (min == null || max == null) return [0, 1]
                return uPlot.rangeNum(autoScale ? min : Math.min(0, min), autoScale ? max : Math.max(0, max), 0.1, true)
              },
            },
          },
          axes: [{
            stroke: ink.axis,
            font,
            size: bottom ? 30 : 0,
            gap: 6,
            space: 84,
            grid: { show: false },
            ticks: { show: bottom, stroke: ink.grid, size: 4 },
            values: bottom ? timeTicks : (_, splits) => splits.map(() => ''),
          }, {
            scale: 'y',
            stroke: ink.axis,
            font,
            size: AXIS_SIZE,
            gap: 6,
            space: 28,
            grid: { stroke: ink.grid, width: 1 },
            ticks: { show: false },
            values: (_, splits) => compactTicks(splits),
          }],
          series: [{}, ...this.seriesFor(pane)],
          hooks: {
            setScale: [(plot, key) => {
              if (key === 'x' && !this.applying) this.applyWindow(plot.scales.x)
            }],
            setCursor: [plot => {
              if (!this.applying) this.updateReadout(plot.cursor.idx)
            }],
            drawSeries: pane.candle ? [(plot, seriesIndex) => {
              if (seriesIndex === 4) drawCandles(plot, this.settings, uPlot.pxRatio)
            }] : [],
          },
        }
        return new uPlot(opts, this.paneData(pane), this.$refs[`pane${index}`][0])
      })
      const navColor = this.candle ? ink.muted : this.panes[0].items[0].color
      this.navPlot = new uPlot({
        width: this.navWidth(),
        height: NAV_HEIGHT,
        padding: [4, 0, 0, 0],
        legend: { show: false },
        cursor: { show: false },
        select: { show: false },
        scales: { x: { time: true }, y: { range: (_, min, max) => min == null ? [0, 1] : uPlot.rangeNum(min, max, 0.1, true) } },
        axes: [{ show: false }, { show: false }],
        series: [{}, { stroke: alpha(navColor, 0.85), width: 1, fill: alpha(navColor, 0.18) }],
      }, this.navData(), this.$refs.navPlot)
      this.applying = false
    },
    applyWindow(window) {
      if (!this.bounds || window.min == null || window.max == null) return
      window = clampWindow(window, this.bounds)
      this.window = window
      this.applying = true
      this.plots.forEach(plot => plot.setScale('x', window))
      this.applying = false
      this.updateNav()
      this.updateReadout(this.plots[0] && this.plots[0].cursor.idx)
      this.$emit('window', { min: window.min * 1000, max: window.max * 1000 })
    },
    updateNav() {
      if (!this.bounds || !this.window) return
      const width = this.navWidth()
      const span = this.bounds.max - this.bounds.min
      const left = (this.window.min - this.bounds.min) / span * width
      const right = (this.window.max - this.bounds.min) / span * width
      this.nav = { left: AXIS_SIZE + left, width: Math.max(6, right - left) }
      this.navGaps = this.missingRanges().map(([min, max]) => ({
        left: AXIS_SIZE + (min - this.bounds.min) / span * width,
        width: (max - min) / span * width,
      }))
    },
    // Complement of the loaded ranges within the bounds, in seconds.
    missingRanges() {
      if (!this.loadedRanges) return []
      const gaps = []
      let cursor = this.bounds.min
      for (const [min, max] of this.loadedRanges) {
        if (min / 1000 > cursor) gaps.push([cursor, min / 1000])
        cursor = Math.max(cursor, max / 1000)
      }
      if (cursor < this.bounds.max) gaps.push([cursor, this.bounds.max])
      return gaps.filter(([min, max]) => max - min > (this.bounds.max - this.bounds.min) / 2000)
    },
    // The legend doubles as the tooltip: values at the cursor, or the newest
    // visible point when the pointer is elsewhere.
    updateReadout(index) {
      const data = this.data
      const times = data ? data[0] : []
      const hovering = index != null && index >= 0 && index < times.length
      if (!hovering) index = this.lastVisibleIndex()
      this.hoverTime = hovering ? formatTime(times[index], this.daily) : ''
      const readout = {}
      for (const pane of this.panes) {
        for (const item of pane.items) readout[item.key] = index == null ? '—' : fullNumber(data[item.column + 1][index])
      }
      this.readout = readout
      if (this.candle) this.ohlc = index == null ? null : this.ohlcAt(index)
    },
    lastVisibleIndex() {
      const times = this.data ? this.data[0] : []
      if (!times.length) return null
      const max = this.window ? this.window.max : Infinity
      let low = 0
      let high = times.length - 1
      while (low < high) {
        const middle = (low + high + 1) >> 1
        if (times[middle] <= max) low = middle
        else high = middle - 1
      }
      return low
    },
    ohlcAt(index) {
      const [, opens, closes, lows, highs] = this.data
      const close = closes[index]
      const base = index > 0 && closes[index - 1] != null ? closes[index - 1] : opens[index]
      const delta = close != null && base ? (close - base) / base * 100 : null
      return {
        open: fullNumber(opens[index]),
        high: fullNumber(highs[index]),
        low: fullNumber(lows[index]),
        close: fullNumber(close),
        change: delta == null ? '' : `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}%`,
        color: close >= opens[index] ? this.settings.upColor : this.settings.downColor,
      }
    },
    toggle(item) {
      const show = !!this.hidden[item.key]
      this.$set(this.hidden, item.key, !show)
      this.panes.forEach((pane, index) => {
        const seriesIndex = pane.columns.indexOf(item.column)
        if (seriesIndex >= 0 && this.plots[index]) this.plots[index].setSeries(seriesIndex + 1, { show })
      })
    },
    applyPreset(preset) {
      if (!this.bounds) return
      this.applyWindow(preset.span == null ? this.bounds : { min: this.bounds.max - preset.span, max: this.bounds.max })
    },
    resetZoom() {
      if (this.bounds) this.applyWindow(this.bounds)
    },
    navTime(event) {
      const rect = this.$refs.nav.getBoundingClientRect()
      const ratio = (event.clientX - rect.left - AXIS_SIZE) / this.navWidth()
      return this.bounds.min + ratio * (this.bounds.max - this.bounds.min)
    },
    navDown(event) {
      if (!this.bounds || !this.window || event.button > 0) return
      const time = this.navTime(event)
      let mode = event.target.dataset.drag
      if (!mode) {
        // Clicking the track recentres the window there, then keeps panning.
        const half = (this.window.max - this.window.min) / 2
        this.applyWindow({ min: time - half, max: time + half })
        mode = 'pan'
      }
      this.drag = { mode, time, window: { ...this.window } }
      try { this.$refs.nav.setPointerCapture(event.pointerId) } catch (_) {}
      event.preventDefault()
    },
    navMove(event) {
      if (!this.drag) return
      const { mode, time, window } = this.drag
      const delta = this.navTime(event) - time
      const minimum = (this.bounds.max - this.bounds.min) / 200
      if (mode === 'min') this.applyWindow({ min: Math.min(window.min + delta, window.max - minimum), max: window.max })
      else if (mode === 'max') this.applyWindow({ min: window.min, max: Math.max(window.max + delta, window.min + minimum) })
      else {
        const shift = Math.max(this.bounds.min - window.min, Math.min(this.bounds.max - window.max, delta))
        this.applyWindow({ min: window.min + shift, max: window.max + shift })
      }
    },
    navUp(event) {
      if (!this.drag) return
      this.drag = null
      try { this.$refs.nav.releasePointerCapture(event.pointerId) } catch (_) {}
    },
    navKey(event) {
      const direction = { ArrowLeft: -1, ArrowRight: 1 }[event.key]
      if (!direction || !this.window) return
      event.preventDefault()
      const step = (this.window.max - this.window.min) * 0.2 * direction
      const shift = Math.max(this.bounds.min - this.window.min, Math.min(this.bounds.max - this.window.max, step))
      this.applyWindow({ min: this.window.min + shift, max: this.window.max + shift })
    },
  },
}
</script>

<style>
.tsc {
  --tsc-text: #303133;
  --tsc-muted: #8a8f98;
  --tsc-line: #e4e7ed;
  --tsc-accent: #2a78d6;
  width: 100%;
  min-width: 0;
  color: var(--tsc-text);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  user-select: none;
  -webkit-user-select: none;
}
.tsc-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px 12px; min-height: 26px; margin-bottom: 4px; }
.tsc-time { color: var(--tsc-muted); }
.tsc-time.hovering { color: var(--tsc-text); }
.tsc-presets { display: inline-flex; padding: 2px; border-radius: 6px; background: #f2f3f5; }
.tsc-presets button { border: 0; border-radius: 4px; padding: 2px 9px; background: transparent; color: #606266; font: inherit; line-height: 18px; cursor: pointer; transition: background .15s, color .15s; }
.tsc-presets button:hover { color: var(--tsc-text); }
.tsc-presets button.active { background: #fff; color: var(--tsc-accent); box-shadow: 0 1px 2px rgba(0, 0, 0, .08); }
.tsc-pane + .tsc-pane { margin-top: 4px; }
.tsc-legend { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 14px; padding-left: 4px; min-height: 22px; }
.tsc-legend b { font-weight: 600; }
.tsc-label { color: var(--tsc-muted); margin-right: 5px; }
.tsc-key { display: inline-flex; align-items: center; border: 0; padding: 2px 0; background: none; color: inherit; font: inherit; cursor: pointer; }
.tsc-key.off { opacity: .4; }
.tsc-key.off b { text-decoration: line-through; }
.tsc-swatch { width: 12px; height: 3px; border-radius: 2px; margin-right: 6px; }
.tsc-ohlc { padding: 2px 0; }
.tsc-change { padding: 2px 0; }
.tsc-plot { position: relative; }
.tsc .u-select { background: rgba(42, 120, 214, .08); border-left: 1px solid rgba(42, 120, 214, .4); border-right: 1px solid rgba(42, 120, 214, .4); }
.tsc .u-cursor-x { border-right: 1px solid #c0c4cc; }
.tsc-nav { position: relative; height: 40px; margin-top: 6px; touch-action: none; cursor: pointer; }
.tsc-nav-plot { position: absolute; left: 56px; top: 0; border-radius: 4px; overflow: hidden; background: #fafbfc; }
.tsc-nav-missing { position: absolute; top: 0; bottom: 0; pointer-events: none; background: repeating-linear-gradient(135deg, rgba(144, 147, 153, .14) 0 2px, transparent 2px 6px); }
.tsc-loading { margin-left: 10px; color: var(--tsc-accent); }
.tsc-nav-shade { position: absolute; top: 0; bottom: 0; background: rgba(255, 255, 255, .72); pointer-events: none; }
.tsc-nav-window { position: absolute; top: 0; bottom: 0; box-sizing: border-box; border: 1px solid rgba(42, 120, 214, .55); border-radius: 4px; background: transparent; cursor: grab; outline: none; }
.tsc-nav-window:active { cursor: grabbing; }
.tsc-nav-window:focus-visible { box-shadow: 0 0 0 2px rgba(42, 120, 214, .35); }
.tsc-handle { position: absolute; top: 50%; width: 8px; height: 22px; margin-top: -11px; border: 1px solid rgba(42, 120, 214, .7); border-radius: 3px; background: #fff; cursor: ew-resize; box-sizing: border-box; }
.tsc-handle[data-drag="min"] { left: -5px; }
.tsc-handle[data-drag="max"] { right: -5px; }
.tsc-handle::after { content: ''; position: absolute; left: 2px; right: 2px; top: 7px; bottom: 7px; border-left: 1px solid rgba(42, 120, 214, .5); border-right: 1px solid rgba(42, 120, 214, .5); }
@media (pointer: coarse) {
  .tsc-handle { width: 14px; height: 30px; margin-top: -15px; }
  .tsc-handle[data-drag="min"] { left: -8px; }
  .tsc-handle[data-drag="max"] { right: -8px; }
}
</style>
