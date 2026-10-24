import React from 'react';
import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Bhutan Tech Connect - Connecting Bhutanese startup founders with college students for short paid projects" />
        <meta name="theme-color" content="#1e3a5f" />
        <title>Bhutan Tech Connect</title>
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
