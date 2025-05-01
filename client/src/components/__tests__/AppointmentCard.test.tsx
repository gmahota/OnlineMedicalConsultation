import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppointmentCard from '../AppointmentCard';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock wouter
jest.mock('wouter', () => ({
  Link: ({ children, href, className }: any) => (
    <a href={href} className={className} data-testid="wouter-link">
      {children}
    </a>
  ),
  useLocation: () => {
    return ["/appointments", jest.fn()];
  },
}));

// Mock the api request function
jest.mock('@/lib/queryClient', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return {
    apiRequest: jest.fn().mockImplementation(() => Promise.resolve({ success: true })),
    queryClient
  };
});

// Setup test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithClient = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  testQueryClient.setQueryData(['/api/users/1'], {
    id: 1,
    fullName: 'Test Patient',
    avatarUrl: null,
    dateOfBirth: '1990-01-01',
  });
  
  const { rerender, ...result } = render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
  return {
    ...result,
    rerender: (rerenderUi: React.ReactElement) =>
      rerender(
        <QueryClientProvider client={testQueryClient}>
          {rerenderUi}
        </QueryClientProvider>
      ),
  };
};

describe('AppointmentCard Component', () => {
  const mockAppointment = {
    id: 1,
    patientId: 1,
    doctorId: 2,
    title: 'Annual Checkup',
    type: 'annual',
    duration: 30,
    date: '2025-05-15T10:00:00.000Z',
    status: 'confirmed',
    consultationMode: 'video',
    notes: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders appointment details correctly', () => {
    renderWithClient(<AppointmentCard appointment={mockAppointment} />);
    
    // Patient name should be visible after data is loaded
    expect(screen.getByText('Test Patient')).toBeInTheDocument();
    
    // Appointment details
    expect(screen.getByText(/May 15, 2025/)).toBeInTheDocument(); // Date format may vary
    expect(screen.getByText('30 min')).toBeInTheDocument();
    expect(screen.getByText('annual')).toBeInTheDocument();
    expect(screen.getByText('confirmed')).toBeInTheDocument();
    
    // Action buttons
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('handles start consultation click for confirmed appointments', async () => {
    const { apiRequest } = require('@/lib/queryClient');
    
    renderWithClient(<AppointmentCard appointment={mockAppointment} />);
    
    // Find and click the Start button
    const startButton = screen.getByText('Start');
    await userEvent.click(startButton);
    
    // Check that the API request was made with correct parameters
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        'PATCH', 
        '/api/appointments/1/start', 
        {}
      );
    });
  });

  it('shows disabled Start button for non-confirmed appointments', () => {
    const pendingAppointment = {
      ...mockAppointment,
      status: 'pending',
    };
    
    renderWithClient(<AppointmentCard appointment={pendingAppointment} />);
    
    // The start button should be disabled for pending appointments
    expect(screen.getByText('Start')).toHaveClass('text-slate-400');
    expect(screen.getByText('Start')).toHaveClass('cursor-not-allowed');
  });

  it('shows correct status and type badge classes', () => {
    const urgentAppointment = {
      ...mockAppointment,
      type: 'urgent',
      status: 'pending',
    };
    
    renderWithClient(<AppointmentCard appointment={urgentAppointment} />);
    
    // Check the status badge
    const statusBadge = screen.getByText('pending');
    expect(statusBadge).toHaveClass('badge-yellow');
    
    // Check the type badge
    const typeBadge = screen.getByText('urgent');
    expect(typeBadge).toHaveClass('badge-red');
  });

  it('formats patient age correctly', () => {
    renderWithClient(<AppointmentCard appointment={mockAppointment} />);
    
    // The test is run in 2025, with birth date in 1990, so the age should be 35
    expect(screen.getByText('35 years old')).toBeInTheDocument();
  });
});