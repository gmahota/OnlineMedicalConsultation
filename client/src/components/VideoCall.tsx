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
        
        // Determine if the current user is a doctor (based on URL or session)
        // In a real app with authentication, we would check the user's role from the session
        // For demo purposes, we can use the URL to determine the role
        const isDoctor = window.location.pathname.includes('doctor') || 
                        localStorage.getItem('userRole') === 'doctor';
        
        // Send initial offer if we're the doctor to initiate the call
        if (isDoctor) {
          try {
            const offer = await rtcPeerConnection.createOffer();
            await rtcPeerConnection.setLocalDescription(offer);
            sendSignalingMessage(socket, {
              type: 'offer',
              sdp: offer,
              appointmentId: appointmentId
            });
            console.log('Sent initial offer as doctor');
          } catch (error) {
            console.error('Error creating/sending offer:', error);
            toast({
              title: "Connection Error",
              description: "Failed to initiate the call. Please try refreshing the page.",
              variant: "destructive",
            });
          }
        } else {
          console.log('Waiting for doctor to initiate the call');
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
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
        {isConnecting && !isConnected ? (
          <div className="text-white text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
            <p>Connecting to the consultation...</p>
            <p className="text-sm text-slate-400 mt-2">Please make sure your camera and microphone are enabled</p>
          </div>
        ) : !isConnected && (
          <div className="text-white text-center p-4">
            <div className="bg-red-900/50 p-4 rounded-lg mb-4">
              <p className="font-medium">Could not establish connection</p>
              <p className="text-sm text-slate-300 mt-2">
                The other participant may not have joined yet or there might be connection issues.
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary-700 hover:bg-primary-800 text-white px-4 py-2 rounded-md"
            >
              Retry Connection
            </button>
          </div>
        )}
        
        <video
          ref={remoteVideoRef}
          className={`w-full h-full object-cover ${!isConnected ? 'opacity-0' : 'opacity-100'}`}
          autoPlay
          playsInline
        />
      </div>
      
      {/* Local video (small overlay) */}
      <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden shadow-lg border-2 border-white">
        <video
          ref={localVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        {!isVideoEnabled && (
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
            <p className="text-white text-xs">Camera Off</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
