'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, TestTube, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Type definitions - will be moved to a separate types file
interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  title: string;
  type: string;
  duration: number;
  date: string;
  status: string;
  consultationMode: string;
  notes: string | null;
}

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  specialization: string | null;
  avatarUrl: string | null;
}

// Temporary AppointmentCard - will be moved to a component
const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
  return (
    <tr key={appointment.id}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            {/* Replace with actual patient image once we have it */}
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
              {appointment.patientId}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">Patient #{appointment.patientId}</div>
            <div className="text-sm text-gray-500">ID: {appointment.patientId}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{new Date(appointment.date).toLocaleDateString()}</div>
        <div className="text-sm text-gray-500">{new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          {appointment.type}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
            appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
            'bg-yellow-100 text-yellow-800'}`}>
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <Link href={`/appointment/${appointment.id}`} className="text-primary-600 hover:text-primary-900 mr-4">
          View
        </Link>
        {appointment.status === 'scheduled' && (
          <Link href={`/video-consultation/${appointment.id}`} className="text-primary-600 hover:text-primary-900">
            Start
          </Link>
        )}
      </td>
    </tr>
  );
};

// Temporary PatientCard - will be moved to a component
const PatientCard = ({ patient }: { patient: User }) => {
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
          Last visit: No recent visits
        </p>
      </div>
      <Link href={`/patient/${patient.id}`} className="text-sm text-primary-700 hover:text-primary-800">
        View
      </Link>
    </div>
  );
};

export default function DashboardPage() {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [recentPatients, setRecentPatients] = useState<User[]>([]);
  const [activeConsultation, setActiveConsultation] = useState<Appointment | null>(null);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoadingActive, setIsLoadingActive] = useState(true);

  useEffect(() => {
    // Fetch today's appointments
    fetch('/api/appointments/today')
      .then(response => response.json())
      .then(data => {
        setTodayAppointments(data);
        setIsLoadingAppointments(false);
      })
      .catch(error => {
        console.error('Error fetching appointments:', error);
        setIsLoadingAppointments(false);
      });

    // Fetch recent patients
    fetch('/api/patients/recent')
      .then(response => response.json())
      .then(data => {
        setRecentPatients(data);
        setIsLoadingPatients(false);
      })
      .catch(error => {
        console.error('Error fetching patients:', error);
        setIsLoadingPatients(false);
      });

    // Fetch active consultation
    fetch('/api/appointments/active')
      .then(response => {
        if (!response.ok && response.status !== 404) {
          throw new Error('Failed to fetch active consultation');
        }
        if (response.status === 404) {
          return null;
        }
        return response.json();
      })
      .then(data => {
        setActiveConsultation(data);
        setIsLoadingActive(false);
      })
      .catch(error => {
        console.error('Error fetching active consultation:', error);
        setIsLoadingActive(false);
      });
  }, []);

  return (
    <div className="main-dashboard mb-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-primary-100 p-3">
                <Calendar className="h-5 w-5 text-primary-700" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Today's Appointments</p>
                <p className="text-2xl font-semibold">{isLoadingAppointments ? "..." : todayAppointments?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-blue-100 p-3">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Total Patients</p>
                <p className="text-2xl font-semibold">247</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-green-100 p-3">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Avg. Consultation Time</p>
                <p className="text-2xl font-semibold">18 min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Active Consultation */}
      {activeConsultation && (
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Active Consultation</h3>
              <div>
                <Link href={`/consultation/${activeConsultation.id}`}>
                  <Button variant="default">
                    Go to Consultation
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex items-center mb-4 md:mb-0 md:mr-8">
                <div className="relative">
                  <img 
                    className="h-16 w-16 rounded-full border-2 border-green-500" 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&w=100&h=100&q=80" 
                    alt="Patient avatar" 
                  />
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium">Emma Wilson</h4>
                  <p className="text-sm text-slate-500">32 years old • Female</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="bg-slate-100 px-4 py-2 rounded-md">
                  <p className="text-xs text-slate-500">START TIME</p>
                  <p className="text-sm font-medium">10:00 AM</p>
                </div>
                <div className="bg-slate-100 px-4 py-2 rounded-md">
                  <p className="text-xs text-slate-500">DURATION</p>
                  <p className="text-sm font-medium">22:15</p>
                </div>
                <div className="bg-slate-100 px-4 py-2 rounded-md">
                  <p className="text-xs text-slate-500">CONSULTATION TYPE</p>
                  <p className="text-sm font-medium">Follow-up</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Upcoming Appointments */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
          <Link href="/appointment-scheduling" className="text-sm text-primary-700 hover:underline">
            View all
          </Link>
        </div>
        
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {isLoadingAppointments ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">Loading appointments...</td>
                  </tr>
                ) : todayAppointments && todayAppointments.length > 0 ? (
                  todayAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">No appointments for today</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      
      {/* Recent Patients & Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Patients</h3>
            <Link href="/patients" className="text-sm text-primary-700 hover:underline">
              View all
            </Link>
          </div>
          
          <div className="space-y-4">
            {isLoadingPatients ? (
              <div className="text-center py-4">Loading patients...</div>
            ) : recentPatients && recentPatients.length > 0 ? (
              recentPatients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))
            ) : (
              <div className="text-center py-4">No recent patients</div>
            )}
          </div>
        </Card>
        
        {/* Calendar */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Calendar</h3>
            <div className="flex space-x-2">
              <button className="p-1 rounded hover:bg-slate-100">
                <span className="sr-only">Previous month</span>
                <span aria-hidden="true">‹</span>
              </button>
              <span className="text-sm font-medium">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              <button className="p-1 rounded hover:bg-slate-100">
                <span className="sr-only">Next month</span>
                <span aria-hidden="true">›</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            <div className="text-xs font-medium text-slate-500">Sun</div>
            <div className="text-xs font-medium text-slate-500">Mon</div>
            <div className="text-xs font-medium text-slate-500">Tue</div>
            <div className="text-xs font-medium text-slate-500">Wed</div>
            <div className="text-xs font-medium text-slate-500">Thu</div>
            <div className="text-xs font-medium text-slate-500">Fri</div>
            <div className="text-xs font-medium text-slate-500">Sat</div>
          </div>
          
          {/* Calendar grid would be dynamically generated with appointments */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* This would be dynamically generated based on current month */}
            {/* Simplified version for illustration */}
            {Array(35).fill(0).map((_, index) => {
              const day = index + 1 - 5; // Offset for starting day of month
              const isCurrentMonth = day > 0 && day <= 31;
              const isToday = day === new Date().getDate(); // Today's date
              
              return (
                <div key={index} className={`h-8 text-xs p-1 ${!isCurrentMonth ? 'text-slate-400' : ''} ${isToday ? 'bg-primary-100 text-primary-700 rounded-full font-medium' : ''}`}>
                  {Math.abs(day)}
                  {isToday && <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"></div>}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-full bg-primary-500 mr-2"></div>
              <span className="text-xs text-slate-600">{todayAppointments?.length || 0} appointments today</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-primary-200 mr-2"></div>
              <span className="text-xs text-slate-600">Upcoming appointments</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}