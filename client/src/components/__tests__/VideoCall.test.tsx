import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VideoCall from '../VideoCall';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock the WebRTC library functions
jest.mock('@/lib/webrtc', () => ({
  initializeWebRTC: jest.fn().mockResolvedValue({
    addEventListener: jest.fn(),
    close: jest.fn(),
  }),
  setupLocalStream: jest.fn().mockImplementation((video, audio) => {
    // Create a mock stream with audio and video tracks
    const mockStream = {
      getTracks: jest.fn().mockReturnValue([
        { kind: 'video', enabled: video },
        { kind: 'audio', enabled: audio }
      ]),
      getVideoTracks: jest.fn().mockReturnValue([
        { kind: 'video', enabled: video, stop: jest.fn() }
      ]),
      getAudioTracks: jest.fn().mockReturnValue([
        { kind: 'audio', enabled: audio, stop: jest.fn() }
      ]),
    };
    return Promise.resolve(mockStream);
  }),
  setupPeerConnection: jest.fn().mockResolvedValue(undefined),
}));

// Mock the socket library functions
jest.mock('@/lib/socket', () => ({
  connectToSocket: jest.fn().mockResolvedValue({
    send: jest.fn(),
    close: jest.fn(),
  }),
  listenForSignaling: jest.fn(),
  sendSignalingMessage: jest.fn(),
  registerIceCandidateEvent: jest.fn(),
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/doctor/consultation/1',
    reload: jest.fn()
  },
  writable: true
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn().mockReturnValue('doctor'),
    setItem: jest.fn(),
  },
  writable: true
});

// Mock HTMLMediaElement
window.HTMLMediaElement.prototype.play = jest.fn();

describe('VideoCall Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component and shows connecting state initially', () => {
    render(
      <VideoCall 
        appointmentId={1} 
        isAudioEnabled={true} 
        isVideoEnabled={true} 
      />
    );
    
    // Check if the connecting message is shown
    expect(screen.getByText('Connecting to the consultation...')).toBeInTheDocument();
    expect(screen.getByText('Please make sure your camera and microphone are enabled')).toBeInTheDocument();
    
    // Video elements should be present
    const videos = document.querySelectorAll('video');
    expect(videos.length).toBe(2);
  });

  it('shows connection error when not connected and not connecting', async () => {
    // Override the setupLocalStream mock to simulate failure
    const { setupLocalStream } = require('@/lib/webrtc');
    setupLocalStream.mockRejectedValueOnce(new Error('Camera access denied'));
    
    render(
      <VideoCall 
        appointmentId={1} 
        isAudioEnabled={true} 
        isVideoEnabled={true} 
      />
    );
    
    // Wait for the connection error to appear
    await waitFor(() => {
      expect(screen.getByText('Could not establish connection')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/The other participant may not have joined yet/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry Connection' })).toBeInTheDocument();
  });

  it('handles retry connection button click', async () => {
    // Override the setupLocalStream mock to simulate failure
    const { setupLocalStream } = require('@/lib/webrtc');
    setupLocalStream.mockRejectedValueOnce(new Error('Camera access denied'));
    
    render(
      <VideoCall 
        appointmentId={1} 
        isAudioEnabled={true} 
        isVideoEnabled={true} 
      />
    );
    
    // Wait for the retry button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Retry Connection' })).toBeInTheDocument();
    });
    
    // Click the retry button
    await userEvent.click(screen.getByRole('button', { name: 'Retry Connection' }));
    
    // Check if window.location.reload was called
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('shows camera off overlay when video is disabled', async () => {
    render(
      <VideoCall 
        appointmentId={1} 
        isAudioEnabled={true} 
        isVideoEnabled={false} 
      />
    );
    
    // Check if the camera off message is shown
    expect(screen.getByText('Camera Off')).toBeInTheDocument();
  });

  it('initializes WebRTC and socket connection on mount', async () => {
    const { initializeWebRTC, setupLocalStream, setupPeerConnection } = require('@/lib/webrtc');
    const { connectToSocket, listenForSignaling, registerIceCandidateEvent } = require('@/lib/socket');
    
    render(
      <VideoCall 
        appointmentId={1} 
        isAudioEnabled={true} 
        isVideoEnabled={true} 
      />
    );
    
    // Wait for WebRTC initialization
    await waitFor(() => {
      expect(initializeWebRTC).toHaveBeenCalled();
      expect(setupLocalStream).toHaveBeenCalledWith(true, true);
      expect(setupPeerConnection).toHaveBeenCalled();
      expect(connectToSocket).toHaveBeenCalledWith('1');
      expect(listenForSignaling).toHaveBeenCalled();
      expect(registerIceCandidateEvent).toHaveBeenCalled();
    });
  });

  it('updates tracks when audio/video enabled state changes', async () => {
    const { setupLocalStream } = require('@/lib/webrtc');
    
    const mockStream = {
      getTracks: jest.fn().mockReturnValue([
        { kind: 'video', enabled: true },
        { kind: 'audio', enabled: true }
      ]),
      getVideoTracks: jest.fn().mockReturnValue([
        { kind: 'video', enabled: true, stop: jest.fn() }
      ]),
      getAudioTracks: jest.fn().mockReturnValue([
        { kind: 'audio', enabled: true, stop: jest.fn() }
      ]),
    };
    
    setupLocalStream.mockResolvedValueOnce(mockStream);
    
    const { rerender } = render(
      <VideoCall 
        appointmentId={1} 
        isAudioEnabled={true} 
        isVideoEnabled={true} 
      />
    );
    
    // Wait for the stream to be initialized
    await waitFor(() => {
      expect(setupLocalStream).toHaveBeenCalledWith(true, true);
    });
    
    // Update props to disable audio
    rerender(
      <VideoCall 
        appointmentId={1} 
        isAudioEnabled={false} 
        isVideoEnabled={true} 
      />
    );
    
    // Check if the tracks were updated
    await waitFor(() => {
      expect(mockStream.getAudioTracks).toHaveBeenCalled();
    });
  });
});