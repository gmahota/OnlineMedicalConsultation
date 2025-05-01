'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, MessageSquare, Clock, Users, FileText, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary-600">MedConsult</span>
            </div>
            <div className="flex gap-4">
              <Link 
                href="/login" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100"
              >
                Log in
              </Link>
              <Link 
                href="/login?tab=register" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Professional Healthcare<br />
                <span className="text-primary-600">Anytime, Anywhere</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                MedConsult connects you with licensed doctors for video consultations, 
                prescription services, and continuous care from the comfort of your home.
              </p>
              <div className="flex gap-4">
                <Link 
                  href="/login?tab=register" 
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Get Started
                </Link>
                <a 
                  href="#how-it-works" 
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white border-gray-200 hover:bg-gray-50"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative h-96 w-full rounded-2xl overflow-hidden bg-primary-100 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-300/30 to-primary-600/30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="flex justify-center">
                      <MessageSquare size={80} className="text-primary-600" />
                    </div>
                    <p className="mt-4 text-lg font-medium text-primary-800">Video Consultation Demo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="how-it-works" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to receive quality healthcare without leaving your home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition duration-300">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Book Appointment</h3>
              <p className="text-gray-600">
                Schedule an appointment with our licensed healthcare professionals at your convenience.
              </p>
            </div>
            
            <div className="p-6 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition duration-300">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Video Consultation</h3>
              <p className="text-gray-600">
                Connect with doctors via secure video call for diagnosis, treatment, and advice.
              </p>
            </div>
            
            <div className="p-6 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition duration-300">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Medical Records</h3>
              <p className="text-gray-600">
                Access your medical history, prescriptions, and treatment plans all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose MedConsult?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Secure & Confidential</h3>
                <p className="text-gray-600">
                  Our platform uses end-to-end encryption to ensure all your communications and medical data remain private and secure.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Licensed Professionals</h3>
                <p className="text-gray-600">
                  All our doctors are licensed, board-certified healthcare professionals with years of experience.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">24/7 Availability</h3>
                <p className="text-gray-600">
                  Get medical consultation whenever you need it, with doctors available around the clock.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Comprehensive Care</h3>
                <p className="text-gray-600">
                  From routine check-ups to specialized consultations, we offer a wide range of healthcare services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">MedConsult</h3>
              <p className="text-sm text-gray-600">
                A telemedicine platform enabling video consultations between doctors and patients with medical history tracking and appointment scheduling.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Services</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-primary-600">Video Consultations</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-primary-600">Appointment Scheduling</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-primary-600">Medical Records</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-primary-600">Prescriptions</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Support</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-primary-600">Help Center</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-primary-600">Contact Us</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-primary-600">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-primary-600">Terms of Service</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Contact</h3>
              <p className="text-sm text-gray-600 mb-2">
                support@medconsult.com
              </p>
              <p className="text-sm text-gray-600">
                +1 (555) 123-4567
              </p>
            </div>
          </div>
          
          <div className="mt-12 border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-600 text-center">
              &copy; {new Date().getFullYear()} MedConsult. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}