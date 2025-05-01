import { Link, useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Appointment, User } from '@shared/schema';

interface AppointmentCardProps {
  appointment: Appointment;
}

const AppointmentCard = ({ appointment }: AppointmentCardProps) => {
  const { toast } = useToast();
  
  const { data: patient } = useQuery<User>({
    queryKey: [`/api/users/${appointment.patientId}`],
  });
  
  // Start consultation mutation
  const [, navigate] = useLocation();
  const startConsultationMutation = useMutation({
    mutationFn: () => {
      return apiRequest("PATCH", `/api/appointments/${appointment.id}/start`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      navigate(`/consultation/${appointment.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start the consultation. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const isConfirmed = appointment.status === 'confirmed';
  const isPending = appointment.status === 'pending';
  
  const getStatusClass = () => {
    switch (appointment.status) {
      case 'confirmed':
        return 'badge-green';
      case 'pending':
        return 'badge-yellow';
      case 'cancelled':
        return 'badge-red';
      case 'completed':
        return 'badge-blue';
      default:
        return 'badge-blue';
    }
  };
  
  const getTypeClass = () => {
    switch (appointment.type) {
      case 'new-patient':
        return 'badge-purple';
      case 'follow-up':
        return 'badge-blue';
      case 'annual':
        return 'badge-green';
      case 'urgent':
        return 'badge-red';
      default:
        return 'badge-blue';
    }
  };
  
  const handleStartConsultation = () => {
    if (isConfirmed) {
      startConsultationMutation.mutate();
    }
  };
  
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img 
              className="h-10 w-10 rounded-full" 
              src={patient?.avatarUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&w=100&h=100&q=80"} 
              alt="Patient avatar" 
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-slate-900">
              {patient?.fullName || `Patient #${appointment.patientId}`}
            </div>
            <div className="text-sm text-slate-500">
              {patient?.dateOfBirth 
                ? `${Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old` 
                : ''}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-slate-900">
          {format(new Date(appointment.date), 'PPp')}
        </div>
        <div className="text-sm text-slate-500">
          {appointment.duration} min
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={getTypeClass()}>
          {appointment.type.replace('-', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={getStatusClass()}>
          {appointment.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <Link href={`/patient/${appointment.patientId}`} className="text-primary-700 hover:text-primary-900 mr-3">
          View
        </Link>
        {isConfirmed ? (
          <Button
            variant="link"
            className="p-0 h-auto text-accent-500 hover:text-accent-700"
            onClick={handleStartConsultation}
            disabled={startConsultationMutation.isPending}
          >
            Start
          </Button>
        ) : (
          <span className="text-slate-400 cursor-not-allowed">Start</span>
        )}
      </td>
    </tr>
  );
};

export default AppointmentCard;
