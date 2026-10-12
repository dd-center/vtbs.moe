// Follower records are numbered 1..total on the server and fetched as
// contiguous slices. This tracks which slices are loaded and, for a requested
// time window, which record numbers still need fetching. Record numbers for
// unloaded times are estimated by interpolating between loaded neighbours, so
// each fetched chunk sharpens the next estimate.
export class ActiveHistory {
  constructor(total) {
    this.total = total
    // Sorted, non-adjacent: [{ from, records }] covering from..from+length-1.
    this.segments = []
  }

  add(from, records) {
    if (!records.length) return
    const to = from + records.length - 1
    const next = []
    let merged = { from, records }
    for (const segment of this.segments) {
      const end = segment.from + segment.records.length - 1
      if (end + 1 < merged.from || segment.from > merged.from + merged.records.length) {
        next.push(segment)
        continue
      }
      // Overlapping or touching: splice the two slices by record number.
      const start = Math.min(segment.from, merged.from)
      const last = Math.max(end, merged.from + merged.records.length - 1)
      const records = Array(last - start + 1)
      for (let index = 0; index < segment.records.length; index++) records[segment.from - start + index] = segment.records[index]
      for (let index = 0; index < merged.records.length; index++) records[merged.from - start + index] = merged.records[index]
      merged = { from: start, records }
    }
    next.push(merged)
    this.segments = next.sort((a, b) => a.from - b.from)
    this.total = Math.max(this.total, to)
  }

  // A live record can only be numbered when nothing is missing before it;
  // otherwise the gap is fetched by number later (see `plan`).
  append(record) {
    const last = this.segments[this.segments.length - 1]
    if (!last || last.from + last.records.length - 1 !== this.total || record.time <= this.newest().time) return false
    this.add(this.total + 1, [record])
    return true
  }

  newest() {
    const last = this.segments[this.segments.length - 1]
    return last ? last.records[last.records.length - 1] : null
  }

  // Loaded time spans in milliseconds, for showing what is still missing.
  ranges() {
    return this.segments.map(({ records }) => [records[0].time, records[records.length - 1].time])
  }

  estimate(time) {
    const anchors = []
    for (const { from, records } of this.segments) {
      const last = records.length - 1
      if (time >= records[0].time && time <= records[last].time) {
        let low = 0
        let high = last
        while (low < high) {
          const middle = (low + high) >> 1
          if (records[middle].time < time) low = middle + 1
          else high = middle
        }
        return from + low
      }
      anchors.push([from, records[0].time], [from + last, records[last].time])
    }
    if (!anchors.length) return this.total
    let before = anchors.filter(([, at]) => at < time).pop()
    let after = anchors.find(([, at]) => at > time)
    if (!before) return Math.max(1, Math.round(after[0] - (after[1] - time) / this.spacing()))
    if (!after) return Math.min(this.total, Math.round(before[0] + (time - before[1]) / this.spacing()))
    const ratio = (time - before[1]) / (after[1] - before[1])
    return Math.round(before[0] + ratio * (after[0] - before[0]))
  }

  // Average milliseconds per record across what is loaded.
  spacing() {
    let records = 0
    let span = 0
    for (const segment of this.segments) {
      records += segment.records.length - 1
      span += segment.records[segment.records.length - 1].time - segment.records[0].time
    }
    return records > 0 && span > 0 ? span / records : 5 * 60 * 1000
  }

  // Missing record ranges for a time window, newest first, cut into chunks.
  plan(min, max, chunk = 1000, margin = 2) {
    const from = Math.max(1, this.estimate(min) - margin)
    // A window reaching the newest loaded record also wants any records
    // beyond it (e.g. ones missed while disconnected).
    const newest = this.newest()
    const to = !newest || max >= newest.time ? this.total : Math.min(this.total, this.estimate(max) + margin)
    const gaps = []
    let cursor = from
    for (const segment of this.segments) {
      const end = segment.from + segment.records.length - 1
      if (end < cursor) continue
      if (segment.from > to) break
      if (segment.from > cursor) gaps.push([cursor, segment.from - 1])
      cursor = end + 1
    }
    if (cursor <= to) gaps.push([cursor, to])
    const chunks = []
    for (const [start, end] of gaps.reverse()) {
      for (let high = end; high >= start; high -= chunk) chunks.push({ skip: Math.max(start, high - chunk + 1) - 1, num: high - Math.max(start, high - chunk + 1) + 1 })
    }
    return chunks
  }
}

// Chart rows: each loaded slice analysed on its own, with a null row between
// slices so the line breaks over unloaded time instead of bridging it.
export function withGaps(slices) {
  const rows = []
  for (const slice of slices) {
    if (!slice.length) continue
    if (rows.length) {
      const previous = rows[rows.length - 1].time
      rows.push({ time: (previous + slice[0].time) / 2, follower: null, change: null })
    }
    rows.push(...slice)
  }
  return rows
}
