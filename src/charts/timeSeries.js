// uPlot uses aligned numeric columns and Unix seconds; API rows stay unchanged.
export function alignTimeSeries(rows, metrics) {
  const times = []
  const columns = metrics.map(() => [])
  const records = []
  let ordered = true
  for (const row of rows) {
    const time = typeof row.time === 'number' ? row.time : typeof row.time === 'string' ? new Date(row.time).getTime() : NaN
    if (!Number.isFinite(time)) continue
    if (times.length && time <= times[times.length - 1]) ordered = false
    times.push(time)
    records.push(row)
  }
  // API history normally arrives in ascending order. Only sort/deduplicate
  // when the input actually requires it (for example a corrected candle).
  let alignedTimes = times
  let alignedRows = records
  if (!ordered) {
    const byTime = new Map(times.map((time, index) => [time, records[index]]))
    alignedTimes = [...byTime.keys()].sort((a, b) => a - b)
    alignedRows = alignedTimes.map(time => byTime.get(time))
  }
  for (let rowIndex = 0; rowIndex < alignedRows.length; rowIndex++) {
    const row = alignedRows[rowIndex]
    for (let index = 0; index < metrics.length; index++) {
      const value = row[metrics[index]]
      columns[index].push(typeof value === 'number' && Number.isFinite(value) ? value : null)
    }
  }
  return [alignedTimes.map(time => time / 1000), ...columns]
}

export function timeBounds(data) {
  const times = data[0]
  if (!times.length) return null
  const min = times[0]
  const max = times[times.length - 1]
  return min === max ? { min: min - 1, max: max + 1 } : { min, max }
}

export function clampWindow(window, bounds) {
  const min = Math.max(bounds.min, Math.min(window.min, bounds.max))
  const max = Math.min(bounds.max, Math.max(window.max, bounds.min))
  return min < max ? { min, max } : { ...bounds }
}

// A window touching the newest point follows live updates; one covering the
// whole series keeps covering it (for example after older history loads).
export function followWindow(window, previous, bounds) {
  if (!previous) return clampWindow(window, bounds)
  const tolerance = (previous.max - previous.min) * 1e-3
  if (window.max >= previous.max - tolerance) {
    if (window.min <= previous.min + tolerance) return { ...bounds }
    const shift = bounds.max - window.max
    return clampWindow({ min: window.min + shift, max: bounds.max }, bounds)
  }
  return clampWindow(window, bounds)
}
