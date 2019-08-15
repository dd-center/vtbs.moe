export default guardMacro => {
  let rows = []

  for (let i = 0; i < guardMacro.length; i++) {
    let { time, guardNum } = guardMacro[i]
    let ISO = new Date(time).toLocaleDateString()
    let currentRow = rows[rows.length - 1] || {}

    if (currentRow.time !== ISO) {
      rows.push({
        time: ISO,
        rawTime: time,
        open: currentRow.close !== undefined ? currentRow.close : guardNum,
        close: guardNum,
        lowest: guardNum,
      })
    } else {
      if (currentRow.lowest > guardNum) {
        rows[rows.length - 1].lowest = guardNum
      }
      rows[rows.length - 1].close = guardNum
    }
  }

  return rows.map(k => ({ highest: k.close, ...k }))
}
