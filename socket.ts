import {createServer} from "http"
import {Server} from "socket.io"
import * as dotenv from "dotenv"
dotenv.config()

const server = createServer()
const io = new Server(server,{
    cors:{
        methods:["POST","GET"],
        origin:"*"
    }
})

io.on("connect",(socket)=>{
    console.log("socket connected!")
    socket.on("disconnect",()=>{
        console.log("socket disconnected!")
    })
})

const PORT = process.env.PORT || 3001

server.listen(PORT,()=>{
    console.log(`Socket server is running on ${PORT}`)
})