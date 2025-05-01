'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  CalendarClock, 
  VideoIcon, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`
        ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0 md:w-20 md:translate-x-0'} 
        fixed md:relative z-10 transition-all duration-300 h-full bg-white border-r border-slate-200 shadow-sm
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
          <div className={`${!isSidebarOpen && 'md:hidden'}`}>
            <h1 className="text-xl font-semibold text-primary-700">MediConsult</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="p-1 rounded-md hover:bg-slate-100 md:hidden"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/dashboard" 
                className={`sidebar-link ${pathname === '/dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                <span className={!isSidebarOpen ? 'md:hidden' : ''}>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/appointment-scheduling" 
                className={`sidebar-link ${pathname === '/appointment-scheduling' ? 'active' : ''}`}
              >
                <CalendarClock className="mr-3 h-5 w-5" />
                <span className={!isSidebarOpen ? 'md:hidden' : ''}>Appointments</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/video-consultation" 
                className={`sidebar-link ${pathname === '/video-consultation' ? 'active' : ''}`}
              >
                <VideoIcon className="mr-3 h-5 w-5" />
                <span className={!isSidebarOpen ? 'md:hidden' : ''}>Consultations</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/patient-history" 
                className={`sidebar-link ${pathname === '/patient-history' ? 'active' : ''}`}
              >
                <FileText className="mr-3 h-5 w-5" />
                <span className={!isSidebarOpen ? 'md:hidden' : ''}>Medical Records</span>
              </Link>
            </li>
            <li>
              <Link href="/patients" className={`sidebar-link ${pathname === '/patients' ? 'active' : ''}`}>
                <Users className="mr-3 h-5 w-5" />
                <span className={!isSidebarOpen ? 'md:hidden' : ''}>Patients</span>
              </Link>
            </li>
            <li>
              <Link href="/settings" className={`sidebar-link ${pathname === '/settings' ? 'active' : ''}`}>
                <Settings className="mr-3 h-5 w-5" />
                <span className={!isSidebarOpen ? 'md:hidden' : ''}>Settings</span>
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="sidebar-link w-full text-left">
                <LogOut className="mr-3 h-5 w-5" />
                <span className={!isSidebarOpen ? 'md:hidden' : ''}>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="p-1 rounded-md hover:bg-slate-100 hidden md:block"
            >
              <Menu size={20} />
            </button>
            <h2 className="ml-4 text-lg font-medium">
              {pathname === '/dashboard' && 'Dashboard'}
              {pathname === '/appointment-scheduling' && 'Appointment Scheduling'}
              {pathname === '/video-consultation' && 'Video Consultation'}
              {pathname === '/patient-history' && 'Patient History'}
              {pathname === '/patients' && 'Patients'}
              {pathname === '/settings' && 'Settings'}
            </h2>
          </div>

          <div className="flex items-center">
            <div className="mr-4 text-sm text-right">
              <div className="font-medium">Dr. Sarah Johnson</div>
              <div className="text-slate-500 text-xs">Cardiologist</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
              SJ
            </div>
          </div>
        </header>

        <main className="p-6 h-[calc(100vh-64px)] overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}