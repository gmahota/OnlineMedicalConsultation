/**
 * Socket management for WebRTC signaling and chat
 */

// Create a WebSocket connection to the server
export const connectToSocket = async (channelId: string): Promise<WebSocket> => {
  return new Promise((resolve, reject) => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws?channelId=${channelId}`;
    
    const socket = new WebSocket(wsUrl);
    
    socket.addEventListener('open', () => {
      console.log(`Socket connected for channel: ${channelId}`);
      resolve(socket);
    });
    
    socket.addEventListener('error', (error) => {
      console.error('Socket connection error:', error);
      reject(error);
    });
  });
};

// Listen for signaling messages for WebRTC
export const listenForSignaling = (socket: WebSocket, peerConnection: RTCPeerConnection) => {
  socket.addEventListener('message', async (event) => {
    const data = JSON.parse(event.data);
    
    // Handle different message types for WebRTC signaling
    if (data.type === 'offer') {
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        sendSignalingMessage(socket, {
          type: 'answer',
          sdp: answer,
          appointmentId: data.appointmentId
        });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    } else if (data.type === 'answer') {
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    } else if (data.type === 'candidate') {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    }
  });
};

// Send signaling message to the server
export const sendSignalingMessage = (socket: WebSocket, message: any) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.error('WebSocket is not open. ReadyState:', socket.readyState);
  }
};

// Register ICE candidate event for WebRTC
export const registerIceCandidateEvent = (peerConnection: RTCPeerConnection, socket: WebSocket, appointmentId: string) => {
  peerConnection.addEventListener('icecandidate', (event) => {
    if (event.candidate) {
      sendSignalingMessage(socket, {
        type: 'candidate',
        candidate: event.candidate,
        appointmentId
      });
    }
  });
};
