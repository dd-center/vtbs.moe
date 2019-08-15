import activeAnalyzer from './activeAnalyzer'
import guardMacroK from './guardMacroK'

const router = ({ name, data }) => {
  if (name === 'activeAnalyzer') {
    return activeAnalyzer(data)
  }
  if (name === 'guardMacroK') {
    return guardMacroK(data)
  }
}

onmessage = ({ data: { id, data } }) => postMessage({ e: id, data: router(data) })
