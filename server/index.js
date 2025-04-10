const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const { Server } = require('socket.io')
require('dotenv').config()
const cors = require('cors');

const app = express()
const server = http.createServer(app)

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
}));

app.use(bodyParser.json())

app.use('/test-route', (req,res) => {
    res.send("Running...")
})

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL, 
        methods: ['GET', 'POST'],
        credentials: true
    }
})


const emailToSocketMapping = new Map()
const socketToEmailMapping = new Map()

io.on('connection', (socket) => {
    console.log('New Connection')

    socket.on('join-room', data => {
        const { emailId, roomId } = data
        console.log('User', emailId, 'Joined Room', roomId)
        socketToEmailMapping.set(socket.id, emailId)
        emailToSocketMapping.set(emailId, socket.id)
        socket.join(roomId)
        socket.emit('joined-room', {roomId})
        socket.broadcast.to(roomId).emit('user-joined', {emailId})
    })

    socket.on('call-user', (data) => {
        const {emailId, offer} = data
        const fromEmail = socketToEmailMapping.get(socket.id)
        const socketId = emailToSocketMapping.get(emailId)
        socket.to(socketId).emit('incoming-call', {from: fromEmail, offer})
    })

    socket.on('call-accepted', (data)=>{
        const { emailId, ans } = data
        const socketId = emailToSocketMapping.get(emailId)
        socket.to(socketId).emit('call-accepted', {ans})
    })
})

const PORT = process.env.PORT || 8000

server.listen(PORT, () => console.log(`Server running at port ${PORT}`))