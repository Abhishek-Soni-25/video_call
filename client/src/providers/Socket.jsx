import React,{ useMemo } from "react";
import { io } from "socket.io-client";

const SocketContex = React.createContext(null)

export const useSocket = () => {
    return React.useContext(SocketContex)
}

export const SocketProvider = (props) => {
    const socket = useMemo(
        () => 
            {
                const URL =
                    process.env.NODE_ENV === 'production'
                    ? 'https://video-call-server-thhf.onrender.com'
                    : 'http://localhost:8001'
                return io(URL)
            },
            []
    )
    return(
        <SocketContex.Provider value={{socket}}>
            {props.children}
        </SocketContex.Provider>
    )
}