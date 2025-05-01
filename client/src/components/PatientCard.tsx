import { Link } from 'wouter';
import { format } from 'date-fns';
import { User } from '@shared/schema';

interface PatientCardProps {
  patient: User;
  lastVisit?: Date;
}

const PatientCard = ({ patient, lastVisit }: PatientCardProps) => {
  return (
    <div className="flex items-center p-2 hover:bg-slate-50 rounded-md">
      <img 
        src={patient.avatarUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&w=100&h=100&q=80"} 
        alt={patient.fullName} 
        className="w-10 h-10 rounded-full object-cover" 
      />
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium">{patient.fullName}</p>
        <p className="text-xs text-slate-500">
          Last visit: {lastVisit ? format(lastVisit, 'PP') : 'No recent visits'}
        </p>
      </div>
      <Link href={`/patient/${patient.id}`} className="text-sm text-primary-700 hover:text-primary-800">
        View
      </Link>
    </div>
  );
};

export default PatientCard;
