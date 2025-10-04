export const metadata = {
  title: 'Login - Access Your Financial Dashboard',
  description: 'Secure login to your PFM Tools account. Access your personalized financial dashboard, AI-powered analytics, and comprehensive money management tools.',
  keywords: [
    'secure login',
    'account access',
    'financial login',
    'user authentication',
    'secure access',
    'financial account',
    'dashboard login',
    'user signin',
    'account security',
    'financial portal'
  ],
  openGraph: {
    title: 'Login - Access Your Financial Dashboard | PFM Tools',
    description: 'Secure access to your personalized financial management platform.',
    images: ['/pfmlogo.png'],
  },
  twitter: {
    title: 'Login - Access Your Financial Dashboard | PFM Tools',
    description: 'Secure access to your personalized financial management platform.',
  },
};

export default function LoginLayout({ children }) {
  return <>{children}</>;
}