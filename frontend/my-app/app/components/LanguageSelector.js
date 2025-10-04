'use client'

import { useState, useEffect, useRef } from 'react'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
]

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState('en')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const translateElementRef = useRef(null)

  useEffect(() => {
    // Check if Google Translate is already loaded
    if (window.google && window.google.translate) {
      setIsLoaded(true)
      return
    }

    // Load Google Translate script
    const script = document.createElement('script')
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    script.async = true
    document.head.appendChild(script)

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: languages.map(l => l.code).join(','),
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        },
        'google_translate_element'
      )

      // Wait for the element to be ready
      setTimeout(() => {
        setIsLoaded(true)
      }, 1000)
    }

    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  const changeLanguage = (langCode) => {
    if (!isLoaded) return

    setCurrentLang(langCode)
    setIsOpen(false)

    // Try to change the language using Google Translate's select
    const attemptChange = () => {
      const select = document.querySelector('.goog-te-combo')
      if (select) {
        select.value = langCode
        select.dispatchEvent(new Event('change', { bubbles: true }))
        return true
      }
      return false
    }

    // Try immediately
    if (!attemptChange()) {
      // If not ready, try again after a short delay
      setTimeout(attemptChange, 500)
    }
  }

  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0]

  return (
    <>
      {/* Hidden Google Translate Element */}
      <div ref={translateElementRef} id="google_translate_element" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}></div>

      {/* Custom Language Selector */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={!isLoaded}
          className="group relative overflow-hidden bg-gradient-to-r from-violet-500/20 to-purple-500/20 hover:from-violet-500/30 hover:to-purple-500/30 border border-violet-500/30 text-violet-300 hover:text-white px-3 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="hidden sm:block">{currentLanguage.name}</span>
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            ></div>

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-48 glass-morphism rounded-2xl p-2 z-50 border border-violet-500/20 shadow-2xl">
              <div className="max-h-64 overflow-y-auto">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 hover:bg-violet-500/10 ${
                      currentLang === lang.code ? 'bg-violet-500/20 text-violet-300' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                    {currentLang === lang.code && (
                      <svg className="w-4 h-4 text-violet-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}