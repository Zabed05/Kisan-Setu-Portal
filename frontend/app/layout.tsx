import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Kisan Setu (KPIP) Platform',
  description: 'Smart Mandi Procurement & Direct Benefit Transfer Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
