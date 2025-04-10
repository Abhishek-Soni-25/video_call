import React,{ useMemo } from "react";
import { io } from "socket.io-client";

const SocketContex = React.createContext(null)

export const useSocket = () => {
    return React.useContext(SocketContex)
}

export const SocketProvider = (props) => {
    const socket = useMemo(
        () => 
            io('https://video-call-server-thhf.onrender.com'),
            []
    )
    return(
        <SocketContex.Provider value={{socket}}>
            {props.children}
        </SocketContex.Provider>
    )
}