import io from "socket.io-client"

const BACKEND_URL = process.env.PORT || "http://localhost:3001";
let socket:ReturnType<typeof io>;
export const initialiseSocket  = ()=>{
    socket = io(BACKEND_URL)
    return socket
}

export const getSocket = ()=>{
    if(!socket){
        throw new Error("Socket not found!")
    }
    return socket
}