import { useEffect, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { MedicalRecord, User } from '@shared/schema';

// Define interfaces for our JSON data
interface VitalSign {
  label: string;
  value: string;
  unit: string;
  isElevated?: boolean;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  quantity: number;
  refills: number;
}

// Function to safely parse JSON strings with proper typing
function safeJsonParse<T>(jsonString: string | null | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error("Error parsing JSON:", e);
    return fallback;
  }
}

interface MedicalHistoryProps {
  patientId: number;
  filter?: string;
  searchQuery?: string;
  limit?: number;
}

export const MedicalHistory = ({ patientId, filter = 'all', searchQuery = '', limit }: MedicalHistoryProps) => {
  const { 
    data: records, 
    isLoading: isLoadingRecords, 
    error: recordsError 
  } = useQuery<MedicalRecord[]>({
    queryKey: [`/api/medical-records/patient/${patientId}`, { filter, searchQuery }],
  });
  
  const [doctors, setDoctors] = useState<Record<number, User>>({});
  
  // Fetch doctors for the medical records
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!records || records.length === 0) return;
      
      // Create an array of unique doctor IDs using an object as a map
      const doctorIdsMap: Record<number, boolean> = {};
      records.forEach(record => {
        doctorIdsMap[record.doctorId] = true;
      });
      const uniqueDoctorIds = Object.keys(doctorIdsMap).map(Number);
      
      const doctorsData: Record<number, User> = {};
      
      for (const id of uniqueDoctorIds) {
        try {
          const response = await fetch(`/api/users/${id}`);
          if (response.ok) {
            const doctor = await response.json();
            doctorsData[id] = doctor;
          }
        } catch (error) {
          console.error(`Error fetching doctor ${id}:`, error);
        }
      }
      
      setDoctors(doctorsData);
    };
    
    fetchDoctors();
  }, [records]);
  
  // Function to format date relative to today
  const formatDate = (date: string | Date) => {
    const recordDate = new Date(date);
    const today = new Date();
    
    if (recordDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (recordDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return format(recordDate, 'MMM d');
  };
  
  // Function to get the icon component for record type
  const getRecordIcon = (record: MedicalRecord) => {
    const appointmentType = record.title?.toLowerCase() || '';
    
    if (record.appointmentId) {
      if (appointmentType.includes('video')) {
        return (
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
        );
      } else {
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        );
      }
    } else if (appointmentType.includes('lab') || appointmentType.includes('test')) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
            <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
      );
    }
  };
  
  if (isLoadingRecords) {
    return (
      <div className="flex justify-center p-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }
  
  if (recordsError) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500 mb-2">Failed to load medical history</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }
  
  if (!records || records.length === 0) {
    return (
      <div className="text-center p-6 bg-slate-50 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <polyline points="13 2 13 9 20 9" />
        </svg>
        <h3 className="text-lg font-medium mb-2">No Medical Records Found</h3>
        <p className="text-slate-500 mb-4">This patient doesn't have any medical records yet.</p>
        <Button asChild>
          <Link href={`/appointments/new?patientId=${patientId}`}>
            Schedule First Appointment
          </Link>
        </Button>
      </div>
    );
  }
  
  // Sort records by date (newest first) and apply limit if provided
  const sortedRecords = [...records]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
  
  return (
    <div className="relative">
      {/* Timeline track */}
      <div className="absolute left-11 top-0 bottom-0 w-px bg-slate-200"></div>
      
      {/* Timeline events */}
      <div className="space-y-6">
        {sortedRecords.map((record) => {
          const createdDate = new Date(record.createdAt);
          const recordDate = formatDate(createdDate);
          const isToday = recordDate === 'Today';
          const doctorName = doctors[record.doctorId]?.fullName || `Doctor #${record.doctorId}`;
          const hasVitals = record.vitals && typeof record.vitals === 'string';
          const vitals = safeJsonParse<VitalSign[]>(record.vitals as string, []);
          
          const hasPrescriptions = record.prescriptions && typeof record.prescriptions === 'string';
          const medications = safeJsonParse<Medication[]>(record.prescriptions as string, []);
          
          return (
            <div key={record.id} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                {getRecordIcon(record)}
                <div className="text-xs text-slate-500 mt-1">{recordDate}</div>
              </div>
              
              <div className={`flex-1 ${isToday ? 'bg-primary-50 border border-primary-100' : 'bg-white border border-slate-200'} rounded-lg p-4`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <h4 className="font-medium">{record.title}</h4>
                  <div className="flex items-center text-sm text-slate-500">
                    <span className="mr-2">{format(createdDate, 'h:mm a')}</span>
                    <span className={`px-2 py-0.5 ${
                      record.title?.includes('Video') 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-slate-100 text-slate-800'
                    } rounded-full text-xs`}>
                      {record.title?.includes('Video') ? 'Video Consultation' : 'In-Person Consultation'}
                    </span>
                  </div>
                </div>
                
                {record.symptoms && (
                  <p className="text-sm text-slate-600 mb-2">{record.symptoms}</p>
                )}
                
                {hasVitals && vitals.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    {vitals.map((vital, index) => (
                      <div 
                        key={index} 
                        className={`${vital.isElevated ? 'bg-red-50' : 'bg-white'} p-2 rounded`}
                      >
                        <p className={`text-xs ${vital.isElevated ? 'text-red-500' : 'text-slate-500'}`}>{vital.label}</p>
                        <p className={`text-sm ${vital.isElevated ? 'font-medium text-red-700' : 'font-medium'}`}>
                          {vital.value} {vital.unit}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                
                {hasPrescriptions && medications.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {medications.map((med, index) => (
                      <div key={index} className="flex items-center text-xs bg-white px-2 py-1 rounded border border-slate-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-primary-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 14a7 7 0 1 0-14 0c0 3 4 8 7 8s7-5 7-8Z" />
                          <path d="M12 12v.01" />
                        </svg>
                        <span>{med.name} {med.dosage}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200">
                  <div className="text-sm">
                    <span className="text-slate-500">Doctor:</span>
                    <span className="font-medium"> {doctorName}</span>
                  </div>
                  <div>
                    <Button variant="link" className="h-auto p-0 text-sm text-primary-700 hover:text-primary-900">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {records.length > sortedRecords.length && (
          <div className="flex justify-center mt-4">
            <Button variant="outline">
              Load older records
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};


