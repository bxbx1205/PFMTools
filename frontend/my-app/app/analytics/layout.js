export const metadata = {
  title: 'Analytics Hub - AI-Powered Financial Intelligence',
  description: 'Advanced AI-powered financial analytics with machine learning predictions, expense forecasting, trend analysis, and personalized financial insights to optimize your spending patterns.',
  keywords: [
    'AI financial analytics',
    'machine learning finance',
    'expense predictions',
    'financial forecasting',
    'spending analysis',
    'financial AI',
    'predictive analytics',
    'financial intelligence',
    'expense insights',
    'financial trends'
  ],
  openGraph: {
    title: 'Analytics Hub - AI-Powered Financial Intelligence | PFM Tools',
    description: 'Unlock the power of AI-driven financial forecasting with machine learning predictions and smart recommendations.',
    images: ['/pfmlogo.png'],
  },
  twitter: {
    title: 'Analytics Hub - AI-Powered Financial Intelligence | PFM Tools',
    description: 'Unlock the power of AI-driven financial forecasting with machine learning predictions and smart recommendations.',
  },
};

export default function AnalyticsLayout({ children }) {
  return <>{children}</>;
}