import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: {
        default: 'SmartEdu AI – Intelligent Learning Assistant',
        template: '%s | SmartEdu AI',
    },
    description: 'AI-Powered Adaptive Learning Platform. Personalized quizzes, intelligent tutoring, real-time analytics.',
    keywords: ['education', 'AI', 'learning', 'quiz', 'adaptive learning', 'edtech'],
    authors: [{ name: 'SmartEdu AI' }],
    openGraph: {
        title: 'SmartEdu AI – Intelligent Learning Assistant',
        description: 'AI-Powered Adaptive Learning Platform',
        url: 'https://smartedu.ai',
        siteName: 'SmartEdu AI',
        type: 'website',
    },
};

import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Toaster position="top-right" />
                {children}
            </body>
        </html>
    );
}
