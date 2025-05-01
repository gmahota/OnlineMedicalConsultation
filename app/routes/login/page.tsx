'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Import UI components once we migrate them
// For now, using placeholder imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Register form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
  role: z.enum(["patient", "doctor"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('login');
  const [isLoginPending, setIsLoginPending] = useState(false);
  const [isRegisterPending, setIsRegisterPending] = useState(false);
  const [error, setError] = useState('');
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'patient',
    },
  });
  
  // Login handler
  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsLoginPending(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      
      // Store auth status and user role in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', data.role);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      setError('Invalid username or password. Please try again.');
    } finally {
      setIsLoginPending(false);
    }
  };
  
  // Register handler
  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setIsRegisterPending(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      
      // Switch to login tab after successful registration
      setActiveTab('login');
    } catch (error) {
      setError('Could not create your account. The username or email may already be in use.');
    } finally {
      setIsRegisterPending(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-primary-700 text-white mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-primary-700">MediConsult</h1>
          <p className="text-slate-600 mt-1">Your Online Medical Consultation Platform</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoginPending}
                    >
                      {isLoginPending ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-slate-500 mt-2">
                  Don't have an account?{" "}
                  <button 
                    type="button"
                    className="text-primary-700 hover:underline"
                    onClick={() => setActiveTab('register')}
                  >
                    Register
                  </button>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Register for a new account on MediConsult
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>I am a:</FormLabel>
                          <div className="flex space-x-4">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="patient"
                                value="patient"
                                checked={field.value === 'patient'}
                                onChange={() => field.onChange('patient')}
                                className="mr-2"
                              />
                              <Label htmlFor="patient">Patient</Label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="doctor"
                                value="doctor"
                                checked={field.value === 'doctor'}
                                onChange={() => field.onChange('doctor')}
                                className="mr-2"
                              />
                              <Label htmlFor="doctor">Doctor</Label>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isRegisterPending}
                    >
                      {isRegisterPending ? "Creating account..." : "Register"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-slate-500 mt-2">
                  Already have an account?{" "}
                  <button 
                    type="button"
                    className="text-primary-700 hover:underline"
                    onClick={() => setActiveTab('login')}
                  >
                    Login
                  </button>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}