import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Mic, Video, MessageSquare, Upload, Share2, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoCall from "@/components/VideoCall";
import MedicalNotes from "@/components/MedicalNotes";
import Chat from "@/components/Chat";
import { MedicalHistory } from "@/components/MedicalHistory";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Appointment, MedicalRecord } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const VideoConsultation = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("notes");
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Fetch appointment details
  const { 
    data: appointment, 
    isLoading: isLoadingAppointment, 
    error: appointmentError 
  } = useQuery<Appointment>({
    queryKey: [`/api/appointments/${id}`],
  });
  
  // Fetch existing medical record if any
  const {
    data: medicalRecord,
    isLoading: isLoadingRecord,
  } = useQuery<MedicalRecord>({
    queryKey: [`/api/medical-records/appointment/${id}`],
  });
  
  // End consultation mutation
  const endConsultationMutation = useMutation({
    mutationFn: () => {
      return apiRequest("PATCH", `/api/appointments/${id}/end`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/appointments/${id}`] });
      toast({
        title: "Consultation ended",
        description: "The consultation has been successfully completed.",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to end the consultation. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Timer effect
  useEffect(() => {
    if (!appointment) return;
    
    const startTime = new Date(appointment.date).getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed > 0 ? elapsed : 0);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [appointment]);
  
  // Format elapsed time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (isLoadingAppointment) {
    return <div className="flex items-center justify-center h-full">Loading consultation...</div>;
  }
  
  if (appointmentError || !appointment) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h3 className="text-xl font-bold mb-2">Consultation Not Found</h3>
        <p className="text-slate-600 mb-4">The consultation you're looking for doesn't exist or has ended.</p>
        <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
      </div>
    );
  }
  
  const handleEndCall = () => {
    if (window.confirm("Are you sure you want to end this consultation?")) {
      endConsultationMutation.mutate();
    }
  };

  return (
    <div className="video-consultation">
      <div className="flex flex-col md:flex-row h-full gap-4">
        <div className="md:w-2/3 h-full">
          <Card className="h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&w=100&h=100&q=80" 
                  alt="Patient" 
                  className="w-10 h-10 rounded-full object-cover" 
                />
                <div className="ml-3">
                  <h3 className="font-medium">
                    {appointment.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Patient: {appointment.patientId} • {new Date(appointment.date).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="flex items-center text-sm text-green-600">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                  {formatTime(elapsedTime)}
                </span>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleEndCall}
                >
                  <PhoneOff className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 bg-slate-900 p-4 relative">
              <VideoCall
                appointmentId={appointment.id}
                isAudioEnabled={isAudioEnabled}
                isVideoEnabled={isVideoEnabled}
              />
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-center space-x-4">
              <Button 
                variant="outline" 
                size="icon" 
                className={isAudioEnabled ? '' : 'bg-slate-200'} 
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className={isVideoEnabled ? '' : 'bg-slate-200'} 
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              >
                <Video className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setActiveTab("chat")}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="destructive" 
                size="icon"
                onClick={handleEndCall}
              >
                <PhoneOff className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
        
        <div className="md:w-1/3 h-full">
          <Card className="h-full flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="border-b border-slate-200">
                <TabsList className="h-auto">
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="notes" className="flex-1 overflow-y-auto p-4 m-0">
                <MedicalNotes 
                  appointmentId={appointment.id} 
                  patientId={appointment.patientId} 
                  doctorId={appointment.doctorId} 
                  initialData={medicalRecord}
                  isLoading={isLoadingRecord}
                />
              </TabsContent>
              
              <TabsContent value="chat" className="flex-1 overflow-y-auto p-4 m-0">
                <Chat appointmentId={appointment.id} />
              </TabsContent>
              
              <TabsContent value="history" className="flex-1 overflow-y-auto p-4 m-0">
                <MedicalHistory patientId={appointment.patientId} />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoConsultation;
