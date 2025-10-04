export const metadata = {
  title: 'Transactions - Smart Expense & Income Tracking',
  description: 'Intelligent transaction management with automated categorization, real-time tracking, expense analytics, and comprehensive financial record keeping for better money management.',
  keywords: [
    'transaction tracking',
    'expense management',
    'income tracking',
    'financial records',
    'money management',
    'expense categorization',
    'financial tracking',
    'spending tracker',
    'transaction history',
    'expense analytics'
  ],
  openGraph: {
    title: 'Transactions - Smart Expense & Income Tracking | PFM Tools',
    description: 'Intelligent transaction management with automated categorization and real-time financial tracking.',
    images: ['/pfmlogo.png'],
  },
  twitter: {
    title: 'Transactions - Smart Expense & Income Tracking | PFM Tools',
    description: 'Intelligent transaction management with automated categorization and real-time financial tracking.',
  },
};

export default function TransactionsLayout({ children }) {
  return <>{children}</>;
}