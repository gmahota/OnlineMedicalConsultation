import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '../login';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock the api request function
jest.mock('@/lib/queryClient', () => ({
  apiRequest: jest.fn().mockImplementation(() => Promise.resolve({ success: true })),
  queryClient: new QueryClient(),
}));

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

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form by default', () => {
    renderWithClient(<Login />);
    
    // Check that the login form elements are displayed
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Enter your credentials to access your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('switches to register form when register tab is clicked', async () => {
    renderWithClient(<Login />);
    
    // Click on the Register tab
    const registerTab = screen.getByRole('tab', { name: 'Register' });
    await userEvent.click(registerTab);
    
    // Check that register form elements are displayed
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Register for a new account on MediConsult')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('I am a:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it('shows validation errors for login form', async () => {
    renderWithClient(<Login />);
    
    // Submit the form without filling in required fields
    const loginButton = screen.getByRole('button', { name: 'Login' });
    await userEvent.click(loginButton);
    
    // Check that validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('shows validation errors for register form', async () => {
    renderWithClient(<Login />);
    
    // Switch to register tab
    const registerTab = screen.getByRole('tab', { name: 'Register' });
    await userEvent.click(registerTab);
    
    // Submit the form without filling in required fields
    const registerButton = screen.getByRole('button', { name: 'Register' });
    await userEvent.click(registerButton);
    
    // Check that validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
      expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  it('submits login form with valid data', async () => {
    const { apiRequest } = require('@/lib/queryClient');
    renderWithClient(<Login />);
    
    // Fill in form fields
    await userEvent.type(screen.getByLabelText('Username'), 'testuser');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    
    // Submit the form
    const loginButton = screen.getByRole('button', { name: 'Login' });
    await userEvent.click(loginButton);
    
    // Check that the apiRequest was called with correct arguments
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/auth/login', {
        username: 'testuser',
        password: 'password123',
      });
    });
  });

  it('submits register form with valid data', async () => {
    const { apiRequest } = require('@/lib/queryClient');
    renderWithClient(<Login />);
    
    // Switch to register tab
    const registerTab = screen.getByRole('tab', { name: 'Register' });
    await userEvent.click(registerTab);
    
    // Fill in form fields
    await userEvent.type(screen.getByLabelText('Full Name'), 'Test User');
    await userEvent.type(screen.getByLabelText('Username'), 'testuser');
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    
    // Select role (patient is default)
    const doctorRadio = screen.getByLabelText('Doctor');
    await userEvent.click(doctorRadio);
    
    // Submit the form
    const registerButton = screen.getByRole('button', { name: 'Register' });
    await userEvent.click(registerButton);
    
    // Check that the apiRequest was called with correct arguments
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/auth/register', {
        fullName: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'doctor',
      });
    });
  });

  it('shows loading state during form submission', async () => {
    const { apiRequest } = require('@/lib/queryClient');
    // Mock a delayed response
    apiRequest.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));
    
    renderWithClient(<Login />);
    
    // Fill in form fields
    await userEvent.type(screen.getByLabelText('Username'), 'testuser');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    
    // Submit the form
    const loginButton = screen.getByRole('button', { name: 'Login' });
    await userEvent.click(loginButton);
    
    // Check that the button shows loading state
    expect(screen.getByRole('button', { name: 'Logging in...' })).toBeInTheDocument();
    
    // Wait for the submission to complete
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalled();
    });
  });
});