import ioClient from 'socket.io-client'

const clusterSocket = ioClient('http://0.0.0.0:9012')

clusterSocket.on('connect', () => console.log('hello Clusters'))

const asyncEmit = (name: string, target: any) => new Promise(resolve => {
  clusterSocket.emit(name, target, resolve)
})


export default ({ url }: { url: string }) => asyncEmit('http', url)
