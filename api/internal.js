module.exports = ({ vtbs }) => async socket => {
  const handler = e => socket.on(e, async (target, arc) => {
    if (typeof arc === 'function') {
      if (e === 'vtbs') {
        arc(vtbs)
      }
    }
  })
  handler('vtbs')
}
