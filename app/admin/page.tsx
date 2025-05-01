'use client';

import React, { useEffect, useState } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown,
  Users,
  Video,
  FileClock,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { db } from '@/db';
import { appointments, users } from '@/shared/schema';
import { eq, and, gt, lt, count } from 'drizzle-orm';

// Card component
const StatCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeType = 'neutral', 
  linkHref, 
  linkText 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  change?: string; 
  changeType?: 'positive' | 'negative' | 'neutral';
  linkHref?: string;
  linkText?: string;
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          
          {change && (
            <div className="flex items-center mt-2">
              {changeType === 'positive' && <ArrowUp className="h-3 w-3 text-green-500 mr-1" />}
              {changeType === 'negative' && <ArrowDown className="h-3 w-3 text-red-500 mr-1" />}
              <span className={`text-xs font-medium ${
                changeType === 'positive' ? 'text-green-500' : 
                changeType === 'negative' ? 'text-red-500' : 'text-slate-400'
              }`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className="h-12 w-12 rounded-md bg-blue-50 flex items-center justify-center">
          {icon}
        </div>
      </div>
      
      {linkHref && linkText && (
        <div className="mt-4 pt-3 border-t">
          <Link href={linkHref} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            {linkText}
          </Link>
        </div>
      )}
    </div>
  );
};

// Alert component
const Alert = ({ title, message, type }: { title: string; message: string; type: 'warning' | 'error' | 'info' }) => {
  const bgColor = type === 'warning' ? 'bg-amber-50' : type === 'error' ? 'bg-red-50' : 'bg-blue-50';
  const textColor = type === 'warning' ? 'text-amber-800' : type === 'error' ? 'text-red-800' : 'text-blue-800';
  const iconColor = type === 'warning' ? 'text-amber-500' : type === 'error' ? 'text-red-500' : 'text-blue-500';
  
  return (
    <div className={`${bgColor} p-4 rounded-md flex items-start`}>
      <AlertCircle className={`${iconColor} h-5 w-5 mr-3 mt-0.5`} />
      <div>
        <h4 className={`text-sm font-medium ${textColor}`}>{title}</h4>
        <p className={`text-sm mt-1 ${textColor} opacity-90`}>{message}</p>
      </div>
    </div>
  );
};

const ActivityItem = ({ 
  title, 
  time, 
  icon, 
  iconBg 
}: { 
  title: string; 
  time: string; 
  icon: React.ReactNode; 
  iconBg: string;
}) => {
  return (
    <div className="flex items-start space-x-3 py-3">
      <div className={`${iconBg} h-8 w-8 rounded-full flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{time}</p>
      </div>
    </div>
  );
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    activeSessions: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total users count
        const totalUsers = await db.select({ count: count() }).from(users);
        
        // Get appointments stats
        const totalAppointments = await db.select({ count: count() }).from(appointments);
        
        // Get pending appointments
        const pendingAppointments = await db.select({ count: count() }).from(appointments)
          .where(eq(appointments.status, 'pending'));
        
        // Get active sessions (appointments in progress)
        const activeSessions = await db.select({ count: count() }).from(appointments)
          .where(eq(appointments.status, 'in-progress'));
        
        setStats({
          totalUsers: totalUsers[0].count,
          totalAppointments: totalAppointments[0].count,
          pendingAppointments: pendingAppointments[0].count,
          activeSessions: activeSessions[0].count
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  // Recent activities (hardcoded for now, but would come from a real activity log in production)
  const recentActivities = [
    { 
      title: 'New user registered (Dr. James Wilson)', 
      time: '15 minutes ago', 
      icon: <User className="h-4 w-4 text-blue-600" />, 
      iconBg: 'bg-blue-100' 
    },
    { 
      title: 'Video consultation started (Dr. Sarah Miller with Patient ID #1042)', 
      time: '1 hour ago', 
      icon: <Video className="h-4 w-4 text-green-600" />, 
      iconBg: 'bg-green-100' 
    },
    { 
      title: 'Appointment rescheduled (ID #354)', 
      time: '2 hours ago', 
      icon: <Calendar className="h-4 w-4 text-amber-600" />, 
      iconBg: 'bg-amber-100' 
    },
    { 
      title: 'System backup completed successfully', 
      time: '3 hours ago', 
      icon: <FileClock className="h-4 w-4 text-purple-600" />, 
      iconBg: 'bg-purple-100' 
    },
  ];
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-slate-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <Alert 
          type="error" 
          title="Error loading dashboard" 
          message={error}
        />
      </div>
    );
  }
  
  return (
    <div className="max-w-8xl mx-auto">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={<Users className="h-6 w-6 text-blue-600" />} 
          change="+12% from last month" 
          changeType="positive"
          linkHref="/admin/users"
          linkText="View all users"
        />
        
        <StatCard 
          title="Total Appointments" 
          value={stats.totalAppointments} 
          icon={<Calendar className="h-6 w-6 text-indigo-600" />} 
          change="+8% from last month" 
          changeType="positive"
          linkHref="/admin/appointments"
          linkText="View all appointments"
        />
        
        <StatCard 
          title="Pending Appointments" 
          value={stats.pendingAppointments} 
          icon={<Clock className="h-6 w-6 text-amber-600" />} 
          change="-5% from last month" 
          changeType="negative"
          linkHref="/admin/appointments?status=pending"
          linkText="View pending"
        />
        
        <StatCard 
          title="Active Sessions" 
          value={stats.activeSessions} 
          icon={<TrendingUp className="h-6 w-6 text-green-600" />} 
          change="Currently active" 
          changeType="neutral"
          linkHref="/admin/consultation-logs"
          linkText="View sessions"
        />
      </div>
      
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Platform Overview</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col space-y-4">
                <Alert 
                  type="info" 
                  title="System Health: Good" 
                  message="All services are operating normally. Last system check: 15 minutes ago." 
                />
                
                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <div className="bg-slate-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-slate-700">User Distribution</h3>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Patients</span>
                        <span>78%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Doctors</span>
                        <span>18%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '18%' }}></div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Admins</span>
                        <span>4%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '4%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-slate-700">Consultation Stats</h3>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Video Consultations</span>
                        <span>65%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>In-Person Consultations</span>
                        <span>35%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Recent Activity</h2>
          </div>
          <div className="p-4">
            <div className="divide-y divide-slate-100">
              {recentActivities.map((activity, index) => (
                <ActivityItem 
                  key={index}
                  title={activity.title}
                  time={activity.time}
                  icon={activity.icon}
                  iconBg={activity.iconBg}
                />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link href="/admin/logs" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                View all activity
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <Link href="/admin/users/create" className="flex flex-col items-center p-4 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">
                <User className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-slate-800">Add User</span>
              </Link>
              
              <Link href="/admin/appointments/create" className="flex flex-col items-center p-4 bg-green-50 rounded-md hover:bg-green-100 transition-colors">
                <Calendar className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-slate-800">Schedule Appointment</span>
              </Link>
              
              <Link href="/admin/system-health" className="flex flex-col items-center p-4 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors">
                <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-slate-800">View System Health</span>
              </Link>
              
              <Link href="/admin/settings" className="flex flex-col items-center p-4 bg-amber-50 rounded-md hover:bg-amber-100 transition-colors">
                <FileClock className="h-8 w-8 text-amber-600 mb-2" />
                <span className="text-sm font-medium text-slate-800">Backup Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}