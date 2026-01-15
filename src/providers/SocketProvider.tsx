import { initialiseSocket } from "@/lib/socket";
import { createContext, ReactNode, useContext, useEffect } from "react";

const SocketContext = createContext<ReturnType<typeof initialiseSocket> | null>(null)


export const SocketProvider  = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    const socket = initialiseSocket()
    useEffect(()=>{
        if(!socket){
            return;
        }
        console.log("frontend connected:",socket.id)
        socket.on("winner-selected",(data:any)=>{
            console.log("winners got selected:",data)
        })
        socket.connect()

        return ()=>{
            socket.disconnect()
        }
    },[])
    return (
        <SocketContext.Provider value={socket} >
            {children}
        </SocketContext.Provider>
    )
}

export const useSocket = ()=>{
    const socket = useContext(SocketContext)
    if(!socket){
        throw new Error("Wrap your app in Socket provider!")
    }
    return socket
}