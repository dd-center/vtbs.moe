import Server from 'socket.io'

export const io = Server({ serveClient: false, perMessageDeflate: false })
