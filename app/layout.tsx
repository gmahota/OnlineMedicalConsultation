import type { Metadata } from 'next';
import React from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'MedConsult - Online Medical Consultation Platform',
  description: 'A telemedicine platform enabling video consultations between doctors and patients with medical history tracking and appointment scheduling',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}