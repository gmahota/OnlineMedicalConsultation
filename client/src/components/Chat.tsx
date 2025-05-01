import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { connectToSocket } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface ChatProps {
  appointmentId: number;
}

interface ChatMessage {
  id: string;
  sender: 'doctor' | 'patient';
  senderName: string;
  message: string;
  timestamp: Date;
}

const Chat = ({ appointmentId }: ChatProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Connect to WebSocket for chat
  useEffect(() => {
    let ws: WebSocket | null = null;
    
    const setupChat = async () => {
      try {
        ws = await connectToSocket(`chat-${appointmentId}`);
        setSocket(ws);
        
        // Listen for incoming messages
        ws.addEventListener('message', (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'chat') {
            const newMessage: ChatMessage = {
              id: data.id,
              sender: data.sender,
              senderName: data.senderName,
              message: data.message,
              timestamp: new Date(data.timestamp)
            };
            
            setMessages(prev => [...prev, newMessage]);
          }
        });
        
        // Connection handling
        ws.addEventListener('open', () => {
          console.log('Chat connection established');
        });
        
        ws.addEventListener('close', () => {
          toast({
            title: "Chat disconnected",
            description: "The chat connection was closed. Please reload the page.",
          });
        });
        
        ws.addEventListener('error', () => {
          toast({
            title: "Chat error",
            description: "There was an error with the chat connection.",
            variant: "destructive",
          });
        });
      } catch (error) {
        console.error('Error setting up chat:', error);
        toast({
          title: "Chat Error",
          description: "Failed to establish chat connection.",
          variant: "destructive",
        });
      }
    };
    
    setupChat();
    
    // Clean up on unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [appointmentId, toast]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      // Using hardcoded doctor info for now - would come from auth context in a real app
      const chatMessage = {
        type: 'chat',
        appointmentId,
        message,
        sender: 'doctor',
        senderName: 'Dr. Sarah Chen',
        timestamp: new Date().toISOString(),
      };
      
      socket.send(JSON.stringify(chatMessage));
      setMessage('');
    } else {
      toast({
        title: "Connection lost",
        description: "Chat connection is not available. Try refreshing the page.",
        variant: "destructive",
      });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-4 pb-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-4">
            <div className="text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] ${msg.sender === 'doctor' ? 'flex-row-reverse' : ''}`}>
                <Avatar className={`h-8 w-8 ${msg.sender === 'doctor' ? 'ml-2' : 'mr-2'}`}>
                  <AvatarImage 
                    src={msg.sender === 'doctor' 
                      ? "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=facearea&w=100&h=100&q=80" 
                      : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&w=100&h=100&q=80"
                    } 
                    alt={msg.senderName} 
                  />
                  <AvatarFallback>{msg.senderName[0]}</AvatarFallback>
                </Avatar>
                <div className={`rounded-lg px-3 py-2 ${
                  msg.sender === 'doctor' 
                    ? 'bg-primary-100 text-primary-900' 
                    : 'bg-slate-100 text-slate-900'
                }`}>
                  <div className="text-xs font-medium mb-1">{msg.senderName}</div>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <div className="text-xs mt-1 opacity-70">
                    {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="border-t pt-3">
        <div className="flex">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[80px] resize-none"
          />
        </div>
        <div className="flex justify-end mt-2">
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
