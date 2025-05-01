'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileClock, 
  Activity, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck
} from 'lucide-react';

const AdminSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const pathname = usePathname();
  
  const navigationItems = [
    { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'User Management', href: '/admin/users', icon: <Users className="h-5 w-5" /> },
    { name: 'Appointment Overview', href: '/admin/appointments', icon: <Calendar className="h-5 w-5" /> },
    { name: 'Consultation Logs', href: '/admin/consultation-logs', icon: <FileClock className="h-5 w-5" /> },
    { name: 'System Health', href: '/admin/system-health', icon: <Activity className="h-5 w-5" /> },
    { name: 'Settings', href: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
  ];
  
  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={onClose} />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-800 shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
            <div className="flex items-center">
              <ShieldCheck className="mr-2 h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold text-white">Admin Panel</span>
            </div>
            <button 
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-700 md:hidden"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                      isActive
                        ? 'bg-blue-900/50 text-blue-300'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <span className={`mr-3 ${isActive ? 'text-blue-300' : 'text-slate-400 group-hover:text-white'}`}>
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Sidebar footer */}
          <div className="border-t border-slate-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-900 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-blue-300" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">System Admin</p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/logout"
                className="flex w-full items-center justify-center rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-full p-1 hover:bg-gray-100 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex flex-1 items-center">
              <h1 className="text-xl font-semibold text-gray-800 md:pl-4">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="rounded-full p-1 hover:bg-gray-100">
                <span className="sr-only">Notifications</span>
                <div className="relative">
                  <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              </button>
              
              {/* User menu */}
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-slate-100 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}