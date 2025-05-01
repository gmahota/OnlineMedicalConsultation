import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Edit, FileText, Heart, Search, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MedicalHistory } from '@/components/MedicalHistory';
import { User, MedicalRecord } from '@shared/schema';

const PatientHistory = () => {
  const { id } = useParams<{ id: string }>();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch patient details
  const { 
    data: patient, 
    isLoading: isLoadingPatient, 
    error: patientError 
  } = useQuery<User>({
    queryKey: [`/api/users/${id}`],
  });
  
  // Fetch patient medical records
  const {
    data: medicalRecords,
    isLoading: isLoadingRecords,
  } = useQuery<MedicalRecord[]>({
    queryKey: [`/api/medical-records/patient/${id}`, { filter, searchQuery }],
  });
  
  if (isLoadingPatient) {
    return <div className="flex items-center justify-center h-full">Loading patient data...</div>;
  }
  
  if (patientError || !patient) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h3 className="text-xl font-bold mb-2">Patient Not Found</h3>
        <p className="text-slate-600 mb-4">The patient you're looking for doesn't exist or has been removed.</p>
        <Button asChild><Link href="/">Return to Dashboard</Link></Button>
      </div>
    );
  }
  
  return (
    <div className="patient-history">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <img 
            src={patient.avatarUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&w=100&h=100&q=80"} 
            alt={patient.fullName} 
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow" 
          />
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-slate-800">{patient.fullName}</h2>
            <div className="flex flex-wrap items-center text-sm text-slate-500">
              {patient.dateOfBirth && (
                <>
                  <span className="mr-3">
                    {Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old
                  </span>
                  <span className="mr-3">•</span>
                </>
              )}
              {patient.gender && (
                <>
                  <span className="mr-3">{patient.gender}</span>
                  <span className="mr-3">•</span>
                </>
              )}
              <span>Patient ID: {patient.id}</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button asChild>
            <Link href={`/appointments/new?patientId=${patient.id}`}>
              <Calendar className="mr-1 h-4 w-4" />
              Schedule Appointment
            </Link>
          </Button>
          <Button variant="outline">
            <Edit className="mr-1 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar: Patient info */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
              
              <div className="space-y-3">
                {patient.dateOfBirth && (
                  <div>
                    <p className="text-xs text-slate-500">DATE OF BIRTH</p>
                    <p className="text-sm font-medium">
                      {new Date(patient.dateOfBirth).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-xs text-slate-500">CONTACT</p>
                  {patient.phone && <p className="text-sm font-medium">{patient.phone}</p>}
                  <p className="text-sm">{patient.email}</p>
                </div>
                
                {patient.address && (
                  <div>
                    <p className="text-xs text-slate-500">ADDRESS</p>
                    <p className="text-sm">{patient.address}</p>
                  </div>
                )}
                
                {/* This would be fetched from a related contacts table in a real app */}
                <div>
                  <p className="text-xs text-slate-500">EMERGENCY CONTACT</p>
                  <p className="text-sm font-medium">Robert Wilson (Husband)</p>
                  <p className="text-sm">+1 (555) 987-6543</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500">ALLERGIES</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Penicillin</span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Sulfa Drugs</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-slate-500">CURRENT MEDICATIONS</p>
                  <ul className="mt-1 space-y-1">
                    <li className="text-sm">• Lisinopril 20mg (daily)</li>
                    <li className="text-sm">• Aspirin 81mg (daily)</li>
                  </ul>
                </div>
                
                <div>
                  <p className="text-xs text-slate-500">CHRONIC CONDITIONS</p>
                  <ul className="mt-1 space-y-1">
                    <li className="text-sm">• Hypertension (diagnosed 2020)</li>
                    <li className="text-sm">• Migraines</li>
                  </ul>
                </div>
                
                <div>
                  <p className="text-xs text-slate-500">BLOOD TYPE</p>
                  <p className="text-sm font-medium">O Positive</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Documents</h3>
              
              <div className="space-y-3">
                <a href="#" className="flex items-center p-2 hover:bg-slate-50 rounded">
                  <div className="rounded-md bg-blue-100 p-2 mr-3">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Blood Test Results</p>
                    <p className="text-xs text-slate-500">Oct 15, 2023 • PDF</p>
                  </div>
                </a>
                
                <a href="#" className="flex items-center p-2 hover:bg-slate-50 rounded">
                  <div className="rounded-md bg-blue-100 p-2 mr-3">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Cardiology Report</p>
                    <p className="text-xs text-slate-500">Sep 22, 2023 • PDF</p>
                  </div>
                </a>
                
                <a href="#" className="flex items-center p-2 hover:bg-slate-50 rounded">
                  <div className="rounded-md bg-blue-100 p-2 mr-3">
                    <Heart className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Chest X-Ray</p>
                    <p className="text-xs text-slate-500">Sep 22, 2023 • DICOM</p>
                  </div>
                </a>
                
                <Button variant="link" className="w-full justify-center">
                  <Upload className="mr-1 h-4 w-4" /> Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content: Medical history timeline */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Medical History</h3>
                <div className="flex space-x-2">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter records" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All records</SelectItem>
                      <SelectItem value="consultations">Consultations</SelectItem>
                      <SelectItem value="lab_results">Lab Results</SelectItem>
                      <SelectItem value="prescriptions">Prescriptions</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search history"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                    <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-slate-400" />
                  </div>
                </div>
              </div>
              
              <MedicalHistory patientId={patient.id} filter={filter} searchQuery={searchQuery} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientHistory;
