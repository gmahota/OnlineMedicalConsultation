'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button';

const VideoConsultation = () => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; sender: 'me' | 'other' }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  
  useEffect(() => {
    // Setup WebSocket connection
    const setupWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        console.log('WebSocket connection established');
        setStatus('connecting');
        // Join a specific room/channel for this consultation
        socket.send(JSON.stringify({ type: 'join', channelId: 'consultation-123' }));
      };
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);
        
        if (data.type === 'chat') {
          setMessages(prev => [...prev, { text: data.message, sender: 'other' }]);
        } else if (data.type === 'webrtc-offer') {
          handleOffer(data.offer);
        } else if (data.type === 'webrtc-answer') {
          handleAnswer(data.answer);
        } else if (data.type === 'webrtc-ice-candidate') {
          handleIceCandidate(data.candidate);
        } else if (data.type === 'user-joined') {
          setStatus('connected');
          // Initiate call when another user joins
          initiateCall();
        }
      };
      
      socket.onclose = () => {
        console.log('WebSocket connection closed');
        setStatus('disconnected');
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus('disconnected');
      };
      
      return socket;
    };
    
    // Setup local media stream
    const setupMediaStream = async () => {
      try {
        const constraints = { video: true, audio: true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // Create RTCPeerConnection
        const configuration = { 
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ] 
        };
        
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnectionRef.current = peerConnection;
        
        // Add local tracks to the connection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });
        
        // Handle remote tracks
        peerConnection.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };
        
        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate && socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
              type: 'webrtc-ice-candidate',
              candidate: event.candidate
            }));
          }
        };
        
        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
          console.log('Connection state:', peerConnection.connectionState);
          if (peerConnection.connectionState === 'connected') {
            setStatus('connected');
          } else if (peerConnection.connectionState === 'disconnected' || 
                    peerConnection.connectionState === 'failed') {
            setStatus('disconnected');
          }
        };
        
      } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Failed to access camera and microphone. Please ensure they are connected and permissions are granted.');
      }
    };
    
    // Initialize WebSocket and media
    const socket = setupWebSocket();
    setupMediaStream();
    
    // Cleanup
    return () => {
      // Close WebSocket connection
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
      
      // Close peer connection and release media
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      
      // Stop all media tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Initiate WebRTC call
  const initiateCall = async () => {
    if (!peerConnectionRef.current || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('Cannot initiate call: Peer connection or socket not ready');
      return;
    }
    
    try {
      // Create offer
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      
      // Send offer to peer
      socketRef.current.send(JSON.stringify({
        type: 'webrtc-offer',
        offer: offer
      }));
      
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };
  
  // Handle incoming WebRTC offer
  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('Cannot handle offer: Peer connection or socket not ready');
      return;
    }
    
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      // Send answer back
      socketRef.current.send(JSON.stringify({
        type: 'webrtc-answer',
        answer: answer
      }));
      
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };
  
  // Handle incoming WebRTC answer
  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) {
      console.error('Cannot handle answer: Peer connection not ready');
      return;
    }
    
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };
  
  // Handle incoming ICE candidate
  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerConnectionRef.current) {
      console.error('Cannot handle ICE candidate: Peer connection not ready');
      return;
    }
    
    try {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };
  
  // Send chat message
  const sendMessage = () => {
    if (!message.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    
    socketRef.current.send(JSON.stringify({
      type: 'chat',
      message: message
    }));
    
    setMessages(prev => [...prev, { text: message, sender: 'me' }]);
    setMessage('');
  };
  
  // Toggle video
  const toggleVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };
  
  // Toggle audio
  const toggleAudio = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };
  
  // End call
  const endCall = () => {
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    // Stop media tracks
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Update UI state
    setStatus('disconnected');
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow py-4 px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Video Consultation</h1>
          <div className="flex space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm ${
              status === 'connected' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              status === 'connecting' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {status === 'connected' ? 'Connected' : 
               status === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </span>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-6 flex flex-col md:flex-row gap-6 overflow-hidden">
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex-1 relative">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Remote Video</h2>
            <video
              ref={remoteVideoRef}
              className="w-full h-[calc(100%-2rem)] bg-gray-200 dark:bg-gray-700 rounded-md object-cover"
              autoPlay
              playsInline
            />
            {status !== 'connected' && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 rounded-md">
                <div className="text-center text-white">
                  <div className="text-xl font-semibold mb-2">Waiting for connection...</div>
                  <div className="text-sm">Make sure the other person is online and has joined the consultation.</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-1/3">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Your Video</h2>
            <video
              ref={videoRef}
              className="w-full h-[calc(100%-2rem)] bg-gray-200 dark:bg-gray-700 rounded-md object-cover"
              autoPlay
              playsInline
              muted
            />
          </div>
        </div>
        
        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex-1 flex flex-col">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Chat</h2>
            <div className="flex-1 overflow-y-auto mb-4 space-y-2">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded-lg max-w-[85%] ${
                    msg.sender === 'me' 
                      ? 'bg-primary/10 text-primary-foreground ml-auto' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center text-gray-400 dark:text-gray-500 py-4">
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Controls</h2>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={toggleVideo} 
                variant={isVideoEnabled ? "default" : "destructive"}
              >
                {isVideoEnabled ? 'Disable Video' : 'Enable Video'}
              </Button>
              <Button 
                onClick={toggleAudio} 
                variant={isAudioEnabled ? "default" : "destructive"}
              >
                {isAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}
              </Button>
              <Button 
                onClick={initiateCall} 
                variant="outline" 
                className="col-span-2"
                disabled={status === 'connected'}
              >
                Start Call
              </Button>
              <Button 
                onClick={endCall} 
                variant="destructive" 
                className="col-span-2"
                disabled={status === 'disconnected'}
              >
                End Call
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideoConsultation;