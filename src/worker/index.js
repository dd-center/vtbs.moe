import Worker from './index.worker.js'

const worker = new Worker()

const ID = () => String(Math.random())

let pool = {}

worker.onmessage = ({ data: { e, data } }) => {
  if (e in pool) {
    pool[e](data)
    delete pool[e]
  }
}

const send = (name, data) => new Promise(resolve => {
  let id = ID()
  pool[id] = resolve
  worker.postMessage({ id, data: { name, data } })
})

export const activeAnalyzer = active => send('activeAnalyzer', active)
