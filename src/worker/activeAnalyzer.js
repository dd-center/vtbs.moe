export default active => {
  if (active.length < 2) {
    return active
  }
  const hourAgo = (time, index) => {
    for (let i = index; i > 0; i--) {
      if (time - active[i].time > 1000 * 60 * 60) {
        return active[i]
      }
    }
    return active[0]
  }
  return active
    .map(({ follower, time, archiveView }, i) => {
      if (!i) {
        return undefined
      }
      const hourAgoInfo = hourAgo(time, i)
      let change = (follower - hourAgoInfo.follower) * 1000 * 60 * 60 / (time - hourAgoInfo.time)
      if (Math.abs(change) > 10) {
        change = Math.round(change)
      }
      return { time, follower, change, archiveView }
    })
    .filter(e => e)
}
