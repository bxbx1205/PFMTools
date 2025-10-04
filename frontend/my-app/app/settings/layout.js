export const metadata = {
  title: 'Settings - Personalize Your Financial Experience',
  description: 'Customize your PFM Tools experience with profile settings, security preferences, notification controls, and advanced financial configuration options.',
  keywords: [
    'account settings',
    'profile management',
    'security settings',
    'financial preferences',
    'notification settings',
    'account security',
    'user preferences',
    'financial configuration',
    'privacy settings',
    'account management'
  ],
  openGraph: {
    title: 'Settings - Personalize Your Financial Experience | PFM Tools',
    description: 'Customize your financial management experience with comprehensive settings and preferences.',
    images: ['/pfmlogo.png'],
  },
  twitter: {
    title: 'Settings - Personalize Your Financial Experience | PFM Tools',
    description: 'Customize your financial management experience with comprehensive settings and preferences.',
  },
};

export default function SettingsLayout({ children }) {
  return <>{children}</>;
}