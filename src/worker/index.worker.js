import activeAnalyzer from './activeAnalyzer'

const router = ({ name, data }) => {
  if (name === 'activeAnalyzer') {
    return activeAnalyzer(data)
  }
}

onmessage = ({ data: { id, data } }) => postMessage({ e: id, data: router(data) })
