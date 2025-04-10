import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";
import ReactPlayer from "react-player"

const RoomPage = () =>{
    const {socket} = useSocket()
    const { peer, createOffer, createAnswer, setRemoteAnswer, sendStream, remoteStream } = usePeer()

    const [myStream, setMyStream] = useState(null)
    const [remoteEmailId, setRemoteEmailId] = useState()

    const handleNewUserJoined = useCallback( async (data) => {
        const {emailId} = data
        console.log('New user joined', emailId)
        const offer = await createOffer()
        socket.emit('call-user', { emailId, offer})
        setRemoteEmailId(emailId)
    }, [createOffer, socket])

    const handleIncomingCall = useCallback(async (data)=>{
        const {from, offer} = data
        console.log('Incoming call from', from, offer)
        const ans = await createAnswer(offer)
        socket.emit('call-accepted', {emailId: from, ans})
        setRemoteEmailId(from)
    },[createAnswer, socket])

    const handleCallAccepted = useCallback(async(data) => {
        const {ans} = data
        console.log('call got accepted')
        await setRemoteAnswer(ans)
    },[setRemoteAnswer])

    const getUserMediaStream = useCallback(async() => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        })
        setMyStream(stream)
    }, [])

    const handleNegotiation = useCallback(() => {
        const localOffer = peer.localDescription
        socket.emit('call-user', { emailId: remoteEmailId, offer: localOffer })
    }, [socket, peer.localDescription, remoteEmailId])

    useEffect(()=>{
        socket.on('user-joined', handleNewUserJoined)
        socket.on('incoming-call', handleIncomingCall)
        socket.on('call-accepted', handleCallAccepted)

        return () => {
            socket.off('user-joined', handleNewUserJoined)
            socket.off('incoming-call', handleIncomingCall)
            socket.off('call-accepted', handleCallAccepted)
        }
    }, [socket, handleNewUserJoined, handleIncomingCall, handleCallAccepted])

    useEffect(() => {
        peer.addEventListener('negotiationneeded', handleNegotiation)
        return () => {
            peer.removeEventListener('negotiationneeded', handleNegotiation)
        }
    }, [handleNegotiation, peer])

    useEffect(()=> {
        getUserMediaStream()
    }, [getUserMediaStream])

    return(
        <div className="room-page-container">
            <h1>Room Page</h1>
            <h4>Your are connected to {remoteEmailId}</h4>
            <button onClick={e => sendStream(myStream)}>Send My Video</button>
            <ReactPlayer url={myStream} playing/>
            <ReactPlayer url={remoteStream} playing/>
        </div>
    )
}

export default RoomPage