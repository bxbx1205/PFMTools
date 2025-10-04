export const metadata = {
  title: 'Dashboard - Your Financial Command Center',
  description: 'Comprehensive financial dashboard with AI-powered analytics, expense tracking, debt management, and real-time insights to optimize your financial health.',
  keywords: [
    'financial dashboard',
    'expense overview',
    'debt management',
    'financial analytics',
    'money tracking',
    'budget overview',
    'financial insights'
  ],
  openGraph: {
    title: 'Dashboard - PFM Tools',
    description: 'Your comprehensive financial command center with AI-powered insights and real-time analytics.',
    images: ['/pfmlogo.png'],
  },
  twitter: {
    title: 'Dashboard - PFM Tools',
    description: 'Your comprehensive financial command center with AI-powered insights and real-time analytics.',
  },
};

export default function DashboardLayout({ children }) {
  return <>{children}</>;
}