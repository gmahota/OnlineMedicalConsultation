import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Sidebar from './Sidebar';
import { useMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [location] = useLocation();
  const isMobile = useMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Close mobile menu on location change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar (hidden on mobile unless toggled) */}
      {(isMobile && isMobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-20 bg-slate-800 bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="absolute top-0 right-0 w-64 h-full bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}
      
      {/* Desktop sidebar (always visible) */}
      {!isMobile && (
        <Sidebar />
      )}
      
      {/* Mobile header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-md bg-primary-700 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19.66 3.99A2 2 0 0 0 18 2.96h-1V1a1 1 0 0 0-2 0v2H9V1a1 1 0 0 0-2 0v1.96H6a2 2 0 0 0-1.66 3.03L9 12.47V17H7v2h10v-2h-2v-4.53l4.66-6.47Z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-primary-700">MediConsult</h1>
            </div>
            <button 
              className="text-slate-500 hover:text-primary-700"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header (visible on desktop) */}
        {!isMobile && (
          <header className="bg-white p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {location === '/' && 'Dashboard'}
                  {location.startsWith('/consultation/') && 'Video Consultation'}
                  {location.startsWith('/patient/') && 'Patient History'}
                  {location === '/appointments' && 'Schedule Appointments'}
                </h2>
                <p className="text-sm text-slate-500">Welcome back, Dr. Chen</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button className="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary-600 rounded-full"></span>
                  </button>
                </div>
                
                <div className="relative group">
                  <button className="flex items-center space-x-2">
                    <img 
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
                      alt="Doctor avatar" 
                      className="w-10 h-10 rounded-full object-cover" 
                    />
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">Dr. Sarah Chen</p>
                      <p className="text-xs text-slate-500">Online</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  
                  {/* Profile dropdown */}
                  <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Your Profile</a>
                      <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Settings</a>
                      <a href="/login" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Sign out</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 mt-16 md:mt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
