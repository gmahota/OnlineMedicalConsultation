/**
 * WebRTC utility functions for video consultations
 */

// Initialize a new WebRTC peer connection
export const initializeWebRTC = async (): Promise<RTCPeerConnection> => {
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };
  
  return new RTCPeerConnection(iceServers);
};

// Get local media stream (camera/microphone)
export const setupLocalStream = async (video: boolean, audio: boolean): Promise<MediaStream> => {
  try {
    const constraints = {
      audio,
      video: video ? { width: 640, height: 480 } : false
    };
    
    return await navigator.mediaStream.getUserMedia(constraints);
  } catch (error) {
    console.error('Error accessing media devices:', error);
    
    // Fall back to audio only if video fails
    if (video) {
      console.log('Falling back to audio only');
      return setupLocalStream(false, audio);
    }
    
    throw error;
  }
};

// Set up peer connection with media tracks and handle remote stream
export const setupPeerConnection = async (
  peerConnection: RTCPeerConnection,
  localStream: MediaStream,
  onRemoteStream: (stream: MediaStream) => void
): Promise<void> => {
  // Add local tracks to the connection
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });
  
  // Create a remote stream and set up track listeners
  const remoteStream = new MediaStream();
  
  peerConnection.addEventListener('track', (event) => {
    event.streams[0].getTracks().forEach(track => {
      remoteStream.addTrack(track);
    });
    
    onRemoteStream(remoteStream);
  });
  
  // Set up connection state change listeners
  peerConnection.addEventListener('connectionstatechange', () => {
    console.log('Connection state:', peerConnection.connectionState);
  });
  
  peerConnection.addEventListener('icecandidateerror', (event) => {
    console.error('ICE candidate error:', event);
  });
};

// Fix for TypeScript navigator.mediaStream
declare global {
  interface Navigator {
    mediaStream: {
      getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
    }
  }
}

// Initialize the mediaStream property if getUserMedia exists but mediaStream doesn't
if (!navigator.mediaStream && navigator.mediaDevices) {
  navigator.mediaStream = {
    getUserMedia: (constraints: MediaStreamConstraints) => {
      return navigator.mediaDevices.getUserMedia(constraints);
    }
  };
}
