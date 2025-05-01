import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { MedicalRecord, NewMedicalRecord } from '@shared/schema';

interface MedicalNotesProps {
  appointmentId: number;
  patientId: number;
  doctorId: number;
  initialData?: MedicalRecord | null;
  isLoading?: boolean;
}

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

const MedicalNotes = ({ 
  appointmentId, 
  patientId, 
  doctorId, 
  initialData, 
  isLoading = false 
}: MedicalNotesProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [followUpPlan, setFollowUpPlan] = useState('');
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([
    { label: 'BP', value: '', unit: 'mmHg' },
    { label: 'HR', value: '', unit: 'bpm' },
    { label: 'Temp', value: '', unit: '°C' },
    { label: 'SpO2', value: '', unit: '%' }
  ]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    instructions: '',
    quantity: 30,
    refills: 0
  });
  const [showAddMedication, setShowAddMedication] = useState(false);
  
  // Initialize with data if available
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSymptoms(initialData.symptoms || '');
      setDiagnosis(initialData.diagnosis || '');
      setClinicalNotes(initialData.notes || '');
      setFollowUpPlan(initialData.followUpPlan || '');
      
      // Set vital signs if available
      if (initialData.vitals) {
        const vitals = JSON.parse(initialData.vitals as string);
        if (Array.isArray(vitals)) {
          setVitalSigns(vitals);
        }
      }
      
      // Set medications if available
      if (initialData.prescriptions) {
        const prescriptions = JSON.parse(initialData.prescriptions as string);
        if (Array.isArray(prescriptions)) {
          setMedications(prescriptions);
        }
      }
    } else {
      // Default title for new consultation
      setTitle('Follow-up Consultation');
    }
  }, [initialData]);
  
  // Update medical record mutation
  const updateRecordMutation = useMutation({
    mutationFn: (updatedRecord: NewMedicalRecord) => {
      const endpoint = initialData 
        ? `/api/medical-records/${initialData.id}` 
        : '/api/medical-records';
      const method = initialData ? 'PATCH' : 'POST';
      
      return apiRequest(method, endpoint, updatedRecord);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/medical-records/appointment/${appointmentId}`] });
      toast({
        title: initialData ? "Notes updated" : "Notes created",
        description: "Medical record has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save medical record. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleSaveNotes = (isDraft = true) => {
    const updatedRecord: NewMedicalRecord = {
      patientId,
      doctorId,
      appointmentId,
      title,
      symptoms,
      diagnosis,
      notes: clinicalNotes,
      vitals: JSON.stringify(vitalSigns),
      prescriptions: JSON.stringify(medications),
      followUpPlan,
    };
    
    updateRecordMutation.mutate(updatedRecord);
  };
  
  const handleVitalSignChange = (index: number, value: string) => {
    const updatedVitalSigns = [...vitalSigns];
    updatedVitalSigns[index].value = value;
    
    // Check if BP is elevated (just an example)
    if (index === 0 && value) {
      const systolic = parseInt(value.split('/')[0]);
      updatedVitalSigns[index].isElevated = systolic > 140;
    }
    
    setVitalSigns(updatedVitalSigns);
  };
  
  const handleAddVitalSign = () => {
    setVitalSigns([...vitalSigns, { label: 'New', value: '', unit: '' }]);
  };
  
  const handleAddMedication = () => {
    if (newMedication.name && newMedication.dosage) {
      setMedications([...medications, {
        id: Date.now().toString(),
        ...newMedication
      }]);
      setNewMedication({
        name: '',
        dosage: '',
        instructions: '',
        quantity: 30,
        refills: 0
      });
      setShowAddMedication(false);
    }
  };
  
  const handleRemoveMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };
  
  if (isLoading) {
    return <div className="p-4 text-center">Loading medical notes...</div>;
  }
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="consultation-title">Consultation Title</Label>
        <Input
          id="consultation-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="symptoms">Symptoms & Complaints</Label>
        <Textarea
          id="symptoms"
          rows={3}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="vitals">Vital Signs</Label>
        <div className="grid grid-cols-2 gap-2 mb-2 mt-1">
          {vitalSigns.map((vital, index) => (
            <div 
              key={index} 
              className={`flex items-center justify-between p-2 rounded ${vital.isElevated ? 'bg-red-50' : 'bg-slate-50'}`}
            >
              <span className="text-xs text-slate-500">{vital.label}:</span>
              <div className="flex items-center">
                <Input
                  value={vital.value}
                  onChange={(e) => handleVitalSignChange(index, e.target.value)}
                  className={`w-20 h-6 text-sm ${vital.isElevated ? 'text-red-700' : 'font-medium'}`}
                />
                <span className="text-xs ml-1">{vital.unit}</span>
              </div>
            </div>
          ))}
        </div>
        <Button 
          variant="link" 
          className="p-0 h-auto text-sm" 
          onClick={handleAddVitalSign}
        >
          + Add vital sign
        </Button>
      </div>
      
      <div>
        <Label htmlFor="clinical-notes">Clinical Notes</Label>
        <Textarea
          id="clinical-notes"
          rows={5}
          value={clinicalNotes}
          onChange={(e) => setClinicalNotes(e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="diagnosis">Diagnosis</Label>
        <Input
          id="diagnosis"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="prescription">Prescription</Label>
        <div className="border border-slate-300 rounded-md divide-y divide-slate-200 mt-1">
          {medications.length === 0 ? (
            <div className="p-3 text-sm text-slate-500 text-center">
              No medications added yet
            </div>
          ) : (
            medications.map(medication => (
              <div key={medication.id} className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-sm">{medication.name}</h4>
                    <p className="text-xs text-slate-500">{medication.dosage}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-1 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveMedication(medication.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </Button>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-slate-600">{medication.instructions}</p>
                  <p className="text-xs text-slate-600">Quantity: {medication.quantity} | Refills: {medication.refills}</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        {showAddMedication ? (
          <Card className="mt-2 p-3">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="med-name" className="text-xs">Medication Name</Label>
                  <Input
                    id="med-name"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                    placeholder="Name"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="med-dosage" className="text-xs">Dosage</Label>
                  <Input
                    id="med-dosage"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                    placeholder="e.g. 20mg tablet"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="med-instructions" className="text-xs">Instructions</Label>
                <Input
                  id="med-instructions"
                  value={newMedication.instructions}
                  onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
                  placeholder="e.g. Take 1 tablet daily"
                  className="h-8 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="med-quantity" className="text-xs">Quantity</Label>
                  <Input
                    id="med-quantity"
                    type="number"
                    value={newMedication.quantity}
                    onChange={(e) => setNewMedication({...newMedication, quantity: parseInt(e.target.value)})}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="med-refills" className="text-xs">Refills</Label>
                  <Input
                    id="med-refills"
                    type="number"
                    value={newMedication.refills}
                    onChange={(e) => setNewMedication({...newMedication, refills: parseInt(e.target.value)})}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAddMedication(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleAddMedication}
                >
                  Add
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Button 
            variant="link" 
            className="p-0 h-auto text-sm mt-2 flex items-center" 
            onClick={() => setShowAddMedication(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add medication
          </Button>
        )}
      </div>
      
      <div>
        <Label htmlFor="follow-up">Follow-up Plan</Label>
        <Textarea
          id="follow-up"
          rows={2}
          value={followUpPlan}
          onChange={(e) => setFollowUpPlan(e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button 
          variant="outline"
          onClick={() => handleSaveNotes(true)}
          disabled={updateRecordMutation.isPending}
        >
          Save Draft
        </Button>
        <Button 
          variant="default"
          onClick={() => handleSaveNotes(false)}
          disabled={updateRecordMutation.isPending}
        >
          Complete & Send
        </Button>
      </div>
    </div>
  );
};

export default MedicalNotes;
