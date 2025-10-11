'use client'

import Head from 'next/head'

export default function SEO({
  title = 'PFM Tools - AI-Powered Personal Finance Management',
  description = 'Advanced AI-powered personal finance management platform with smart analytics, expense tracking, debt management, and predictive insights.',
  keywords = [],
  image = '/pfmlogo.png',
  url = 'https://pfmtools.app',
  type = 'website',
  noindex = false,
  children
}) {
  const fullTitle = title.includes('PFM Tools') ? title : `${title} | PFM Tools`
  const fullUrl = url.startsWith('http') ? url : `https://pfmtools.app${url}`
  
  const defaultKeywords = [
    'personal finance',
    'AI finance',
    'expense tracking',
    'debt management',
    'financial analytics',
    'money management'
  ]
  
  const allKeywords = [...new Set([...keywords, ...defaultKeywords])]

  return (
    <Head>
      {}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords.join(', ')} />
      <meta name="author" content="PFM Tools Team" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#8b5cf6" />
      
      {}
      <link rel="icon" href="/pfmlogo.png" />
      <link rel="apple-touch-icon" href="/pfmlogo.png" />
      <link rel="shortcut icon" href="/pfmlogo.png" />
      
      {}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`https://pfmtools.app${image}`} />
      <meta property="og:site_name" content="PFM Tools" />
      <meta property="og:locale" content="en_US" />
      
      {}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`https://pfmtools.app${image}`} />
      <meta name="twitter:creator" content="@pfmtools" />
      
      {}
      <meta name="application-name" content="PFM Tools" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="PFM Tools" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-TileColor" content="#8b5cf6" />
      <meta name="msapplication-tap-highlight" content="no" />
      
      {}
      <link rel="canonical" href={fullUrl} />
      
      {}
      <link rel="manifest" href="/manifest.json" />
      
      {}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {}
      <link rel="preload" href="/pfmlogo.png" as="image" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      
      {children}
    </Head>
  )
}