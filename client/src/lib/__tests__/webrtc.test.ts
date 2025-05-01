import { initializeWebRTC, setupLocalStream, setupPeerConnection } from '../webrtc';

// Mock the RTCPeerConnection
class MockRTCPeerConnection {
  iceServers: any;
  connectionState: string = 'new';
  
  constructor(config: any) {
    this.iceServers = config.iceServers;
  }
  
  addEventListener = jest.fn((event, callback) => {
    if (event === 'connectionstatechange') {
      setTimeout(() => {
        this.connectionState = 'connected';
        callback();
      }, 10);
    }
    if (event === 'track') {
      setTimeout(() => {
        callback({
          streams: [{
            getTracks: () => [{ id: 'remote-track-id' }]
          }]
        });
      }, 10);
    }
  });
  
  addTrack = jest.fn();
  close = jest.fn();
}

// Mock MediaStream
class MockMediaStream {
  tracks: any[];
  
  constructor(tracks: any[] = []) {
    this.tracks = tracks;
  }
  
  getTracks() {
    return this.tracks;
  }
  
  getAudioTracks() {
    return this.tracks.filter(track => track.kind === 'audio');
  }
  
  getVideoTracks() {
    return this.tracks.filter(track => track.kind === 'video');
  }
  
  addTrack(track: any) {
    this.tracks.push(track);
  }
}

// Mock global objects
global.RTCPeerConnection = MockRTCPeerConnection as any;
global.MediaStream = MockMediaStream as any;

// Mock getUserMedia
const mockGetUserMedia = jest.fn((constraints) => {
  if (constraints.video === false && constraints.audio === false) {
    return Promise.reject(new Error('No media requested'));
  }
  
  const tracks = [];
  
  if (constraints.video) {
    tracks.push({
      kind: 'video',
      enabled: true,
      stop: jest.fn()
    });
  }
  
  if (constraints.audio) {
    tracks.push({
      kind: 'audio',
      enabled: true,
      stop: jest.fn()
    });
  }
  
  return Promise.resolve(new MockMediaStream(tracks));
});

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia
  },
  writable: true
});

describe('WebRTC Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('initializeWebRTC', () => {
    it('should create a new RTCPeerConnection with STUN servers', async () => {
      const peerConnection = await initializeWebRTC();
      
      expect(peerConnection).toBeInstanceOf(MockRTCPeerConnection);
      expect(peerConnection.iceServers).toEqual([
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]);
    });
  });
  
  describe('setupLocalStream', () => {
    it('should get user media with video and audio', async () => {
      const stream = await setupLocalStream(true, true);
      
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        audio: true,
        video: { width: 640, height: 480 }
      });
      
      expect(stream.getTracks().length).toBe(2);
      expect(stream.getVideoTracks().length).toBe(1);
      expect(stream.getAudioTracks().length).toBe(1);
    });
    
    it('should get user media with only audio', async () => {
      const stream = await setupLocalStream(false, true);
      
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        audio: true,
        video: false
      });
      
      expect(stream.getTracks().length).toBe(1);
      expect(stream.getAudioTracks().length).toBe(1);
      expect(stream.getVideoTracks().length).toBe(0);
    });
    
    it('should fall back to audio only if video access fails', async () => {
      // First mock call rejects, second one succeeds
      mockGetUserMedia
        .mockRejectedValueOnce(new Error('Camera access denied'))
        .mockImplementationOnce((constraints) => {
          return Promise.resolve(new MockMediaStream([{
            kind: 'audio',
            enabled: true,
            stop: jest.fn()
          }]));
        });
      
      const stream = await setupLocalStream(true, true);
      
      // First attempt with video
      expect(mockGetUserMedia).toHaveBeenNthCalledWith(1, {
        audio: true,
        video: { width: 640, height: 480 }
      });
      
      // Second attempt without video
      expect(mockGetUserMedia).toHaveBeenNthCalledWith(2, {
        audio: true,
        video: false
      });
      
      expect(stream.getTracks().length).toBe(1);
      expect(stream.getAudioTracks().length).toBe(1);
    });
  });
  
  describe('setupPeerConnection', () => {
    it('should add local tracks to the peer connection', async () => {
      const peerConnection = await initializeWebRTC();
      const localStream = new MockMediaStream([
        { kind: 'video', enabled: true, id: 'video-track-id' },
        { kind: 'audio', enabled: true, id: 'audio-track-id' }
      ]);
      const onRemoteStream = jest.fn();
      
      await setupPeerConnection(peerConnection, localStream, onRemoteStream);
      
      expect(peerConnection.addTrack).toHaveBeenCalledTimes(2);
      expect(peerConnection.addEventListener).toHaveBeenCalledWith('track', expect.any(Function));
      expect(peerConnection.addEventListener).toHaveBeenCalledWith('connectionstatechange', expect.any(Function));
      expect(peerConnection.addEventListener).toHaveBeenCalledWith('icecandidateerror', expect.any(Function));
    });
    
    it('should call onRemoteStream when remote tracks are received', async () => {
      const peerConnection = await initializeWebRTC();
      const localStream = new MockMediaStream([{ kind: 'video', enabled: true }]);
      const onRemoteStream = jest.fn();
      
      await setupPeerConnection(peerConnection, localStream, onRemoteStream);
      
      // Wait for the track event to be triggered
      await new Promise(resolve => setTimeout(resolve, 20));
      
      expect(onRemoteStream).toHaveBeenCalled();
      expect(onRemoteStream.mock.calls[0][0]).toBeInstanceOf(MockMediaStream);
      expect(onRemoteStream.mock.calls[0][0].getTracks().length).toBe(1);
    });
  });
});