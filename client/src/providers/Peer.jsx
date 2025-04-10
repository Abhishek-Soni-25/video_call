import React, { useCallback, useEffect, useMemo, useState } from "react";

const PeerContext = React.createContext(null)

export const usePeer = () => React.useContext(PeerContext)

export const PeerProvider = (props) => {
    const [remoteStream, setRemoteStream] = useState(null)
    const [hasSentStream, setHasSentStream] = useState(false)

    const peer = useMemo( () => new RTCPeerConnection(), [])

    const createOffer = async() =>{
        const offer = await peer.createOffer()
        await peer.setLocalDescription(offer)
        return offer
    }

    const createAnswer = async (offer) => {
        await peer.setRemoteDescription(offer)
        const answer = await peer.createAnswer()
        await peer.setLocalDescription(answer)
        return answer
    }

    const setRemoteAnswer = async (ans) => {
        if (peer.signalingState !== "have-local-offer") {
            console.warn("❌ Cannot set answer, peer is in wrong state:", peer.signalingState)
            return
        }
        await peer.setRemoteDescription(ans)
    }

    const sendStream = async (stream) => {
        if (hasSentStream) return
        const tracks = stream.getTracks()
        for(const track of tracks){
            peer.addTrack(track, stream)
        }
        setHasSentStream(true)
    }

    const handleTrackEvent = useCallback((ev) => {
        const streams = ev.streams
        setRemoteStream(streams[0])
    }, [])  

    useEffect( () => {
        peer.addEventListener('track', handleTrackEvent)
        return () => {
            peer.removeEventListener('track', handleTrackEvent)
        }
    }, [peer, handleTrackEvent])

    return(
        <PeerContext.Provider value={{
            peer, createOffer, createAnswer,setRemoteAnswer, sendStream, remoteStream
            }}>
            {props.children}
        </PeerContext.Provider>
    )
}