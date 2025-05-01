import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { Calendar } from '@/components/Calendar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Appointment, User, NewAppointment } from '@shared/schema';

const AppointmentScheduling = () => {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [duration, setDuration] = useState('30');
  const [appointmentType, setAppointmentType] = useState('follow-up');
  const [consultationMode, setConsultationMode] = useState('video');
  const [notes, setNotes] = useState('');
  const [reminders, setReminders] = useState({
    email: true,
    sms: true,
    whatsapp: false
  });
  
  // Fetch appointments for the calendar
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments', { month: format(currentMonth, 'yyyy-MM') }],
  });
  
  // Fetch available time slots for selected date
  const { data: timeSlots } = useQuery<string[]>({
    queryKey: ['/api/appointments/time-slots', { date: format(selectedDate, 'yyyy-MM-dd') }],
    enabled: !!selectedDate,
  });
  
  // Fetch patients list for dropdown
  const { data: patients, isLoading: isLoadingPatients } = useQuery<User[]>({
    queryKey: ['/api/patients'],
  });
  
  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: (newAppointment: NewAppointment) => {
      return apiRequest("POST", "/api/appointments", newAppointment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Appointment scheduled",
        description: "The appointment has been successfully scheduled.",
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to schedule the appointment. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const resetForm = () => {
    setSelectedPatient('');
    setSelectedTimeSlot('10:00');
    setDuration('30');
    setAppointmentType('follow-up');
    setConsultationMode('video');
    setNotes('');
    setReminders({
      email: true,
      sms: true,
      whatsapp: false
    });
  };
  
  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleScheduleAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      toast({
        title: "Missing information",
        description: "Please select a patient.",
        variant: "destructive",
      });
      return;
    }
    
    const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hours, minutes, 0, 0);
    
    const newAppointment: NewAppointment = {
      patientId: parseInt(selectedPatient),
      doctorId: 1, // This would be the current doctor's ID from auth context
      date: appointmentDate.toISOString(),
      duration: parseInt(duration),
      title: `${appointmentType.charAt(0).toUpperCase() + appointmentType.slice(1)} Appointment`,
      type: appointmentType,
      status: "confirmed",
      consultationMode: consultationMode,
      notes: notes,
    };
    
    createAppointmentMutation.mutate(newAppointment);
  };
  
  return (
    <div className="appointment-scheduling">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Schedule Appointments</h2>
        <p className="text-slate-500">Manage and schedule your consultations</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevMonth}
                  >
                    <span className="sr-only">Previous month</span>
                    <span aria-hidden="true">‹</span>
                  </Button>
                  <h3 className="text-lg font-semibold mx-4">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextMonth}
                  >
                    <span className="sr-only">Next month</span>
                    <span aria-hidden="true">›</span>
                  </Button>
                </div>
                
                <div className="flex">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date())}
                  >
                    Today
                  </Button>
                </div>
              </div>
              
              <Calendar
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                appointments={appointments || []}
                onDateClick={handleDateClick}
                isLoading={isLoadingAppointments}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* New appointment form */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Schedule New Appointment</h3>
              
              <form onSubmit={handleScheduleAppointment}>
                <div className="mb-4">
                  <Label htmlFor="patient">Patient</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Search patient name" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingPatients ? (
                        <SelectItem value="loading" disabled>
                          Loading patients...
                        </SelectItem>
                      ) : patients && patients.length > 0 ? (
                        patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.fullName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No patients found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    type="date"
                    id="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => setSelectedDate(parseISO(e.target.value))}
                  />
                </div>
                
                <div className="mb-4">
                  <Label>Time Slots</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots ? (
                      timeSlots.map((time) => (
                        <div key={time}>
                          <RadioGroup value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value={time} id={`time-${time}`} />
                              <Label htmlFor={`time-${time}`} className="cursor-pointer">
                                {time}
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      ))
                    ) : (
                      // Default time slots if API doesn't return any
                      ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'].map((time) => (
                        <div key={time}>
                          <RadioGroup value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value={time} id={`time-${time}`} />
                              <Label htmlFor={`time-${time}`} className="cursor-pointer">
                                {time}
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="duration">Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="type">Appointment Type</Label>
                  <Select value={appointmentType} onValueChange={setAppointmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new-patient">New Patient</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="annual">Annual Checkup</SelectItem>
                      <SelectItem value="urgent">Urgent Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="consultation-mode">Consultation Mode</Label>
                  <RadioGroup value={consultationMode} onValueChange={setConsultationMode}>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="video" id="mode-video" />
                        <Label htmlFor="mode-video">Video</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="in-person" id="mode-in-person" />
                        <Label htmlFor="mode-in-person">In-person</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional information about the appointment"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="mb-4">
                  <Label>Send Reminders</Label>
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reminder-email"
                        checked={reminders.email}
                        onCheckedChange={(checked) => 
                          setReminders({...reminders, email: checked === true})
                        }
                      />
                      <Label htmlFor="reminder-email">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reminder-sms"
                        checked={reminders.sms}
                        onCheckedChange={(checked) => 
                          setReminders({...reminders, sms: checked === true})
                        }
                      />
                      <Label htmlFor="reminder-sms">SMS</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reminder-whatsapp"
                        checked={reminders.whatsapp}
                        onCheckedChange={(checked) => 
                          setReminders({...reminders, whatsapp: checked === true})
                        }
                      />
                      <Label htmlFor="reminder-whatsapp">WhatsApp</Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="default"
                    disabled={createAppointmentMutation.isPending}
                  >
                    {createAppointmentMutation.isPending ? "Scheduling..." : "Schedule Appointment"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppointmentScheduling;
