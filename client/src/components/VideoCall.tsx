import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { initializeWebRTC, setupLocalStream, setupPeerConnection } from '@/lib/webrtc';
import { connectToSocket, listenForSignaling, sendSignalingMessage, registerIceCandidateEvent } from '@/lib/socket';

interface VideoCallProps {
  appointmentId: number;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

const VideoCall = ({ appointmentId, isAudioEnabled, isVideoEnabled }: VideoCallProps) => {
  const { toast } = useToast();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  
  // Initialize WebRTC and socket connection
  useEffect(() => {
    const setupCall = async () => {
      try {
        // Initialize WebRTC
        const rtcPeerConnection = await initializeWebRTC();
        setPeerConnection(rtcPeerConnection);
        
        // Setup local stream
        const stream = await setupLocalStream(isVideoEnabled, isAudioEnabled);
        setLocalStream(stream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Setup peer connection
        await setupPeerConnection(rtcPeerConnection, stream, (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            setIsConnected(true);
            setIsConnecting(false);
          }
        });
        
        // Connect to signaling server
        const socket = await connectToSocket(appointmentId.toString());
        
        // Listen for signaling messages
        listenForSignaling(socket, rtcPeerConnection);
        
        // Register ICE candidate event
        registerIceCandidateEvent(rtcPeerConnection, socket, appointmentId.toString());
        
        // Send initial offer if we're the doctor
        // In a real app, we'd determine if the current user is the doctor
        const isDoctor = true;
        if (isDoctor) {
          const offer = await rtcPeerConnection.createOffer();
          await rtcPeerConnection.setLocalDescription(offer);
          sendSignalingMessage(socket, {
            type: 'offer',
            sdp: offer,
            appointmentId: appointmentId
          });
        }
        
        return () => {
          // Cleanup
          stream.getTracks().forEach(track => track.stop());
          rtcPeerConnection.close();
          socket.close();
        };
      } catch (error) {
        console.error('Error setting up WebRTC:', error);
        toast({
          title: "Connection Error",
          description: "Failed to establish video connection. Please try refreshing the page.",
          variant: "destructive",
        });
        setIsConnecting(false);
      }
    };
    
    setupCall();
  }, [appointmentId, isAudioEnabled, isVideoEnabled, toast]);
  
  // Update audio/video tracks when enabled state changes
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isAudioEnabled;
      });
      
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoEnabled;
      });
    }
  }, [isAudioEnabled, isVideoEnabled, localStream]);
  
  return (
    <div className="h-full relative">
      {/* Main Video (Patient/Remote) */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isConnecting && !isConnected && (
          <div className="text-white text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
            <p>Connecting to the consultation...</p>
          </div>
        )}
        <video
          ref={remoteVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
        />
      </div>
      
      {/* Doctor's video (small overlay) */}
      <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden shadow-lg border-2 border-white">
        <video
          ref={localVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
      </div>
    </div>
  );
};

export default VideoCall;
