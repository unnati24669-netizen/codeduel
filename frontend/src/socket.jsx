import {io} from "socket.io-client"

let socketio;
export function ioCreation(){
    if(socketio){
        return socketio;
    }
    const token=localStorage.getItem("token")
    const backendUrl=import.meta.env.VITE_BACKEND_URL || "http://localhost:5500"
    
    socketio=io(backendUrl,{auth:{token}, transports:["websocket"]})

    socketio.on("connect_error",(err)=>{
        if(err.message.includes("authentication") || err.message.includes("token")){
            localStorage.removeItem("token")
            window.location.href="/login"
        }
    })

    return socketio;
}