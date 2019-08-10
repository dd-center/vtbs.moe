onmessage = ({ data }) => {
  if (data.length < 2) {
    return data
  }
  const hourAgo = (time, index) => {
    for (let i = index; i > 0; i--) {
      if (time - data[i].time > 1000 * 60 * 60) {
        return data[i]
      }
    }
    return data[0]
  }
  postMessage(data
    .map(({ follower, time }, i) => {
      if (!i) {
        return undefined
      }
      const hourAgoInfo = hourAgo(time, i)
      let change = (follower - hourAgoInfo.follower) * 1000 * 60 * 60 / (time - hourAgoInfo.time)
      if (Math.abs(change) > 10) {
        change = Math.round(change)
      }
      return { time, follower, change }
    })
    .filter(e => e))
}
