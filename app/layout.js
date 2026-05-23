'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { ToastProvider } from '@/components/Toast';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next";
import './globals.css';

export default function RootLayout({ children }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <html lang="en">
            <head>
                <title>ZYNO Procure — AI-Powered Procurement Management</title>
                <meta name="description" content="Comprehensive procurement management system with AI-powered insights, vendor management, and streamlined workflows." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
            </head>
            <body>
                <ToastProvider>
                    <div className="app-layout">
                        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
                        <div className={`main-wrapper${collapsed ? ' sidebar-collapsed' : ''}`}>
                            <Topbar />
                            <div className="page-content">
                                {children}
                            </div>
                        </div>
                    </div>
                    <Analytics />
                    <SpeedInsights />
                </ToastProvider>
            </body>
        </html>
    );
}
