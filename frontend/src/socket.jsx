import {io} from "socket.io-client"

let socketio;
export function ioCreation(){
    if(socketio){
        return socketio;
    }
    const token=localStorage.getItem("token")
    
    socketio=io(import.meta.env.VITE_BACKEND_URL,{auth:{token}})
    return socketio;
}