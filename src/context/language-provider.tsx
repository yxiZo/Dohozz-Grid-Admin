import { createContext, useContext, useEffect, useState } from 'react'
import { getCookie, setCookie } from '@/lib/cookies'

export type Language = 'zh' | 'en'

const DEFAULT_LANGUAGE: Language = 'zh'
const LANGUAGE_COOKIE_NAME = 'lang'
const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

export const languageOptions: { value: Language; label: string }[] = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
]

const translations = {
  zh: {
    'leads.title': '客户 / 线索管理',
    'leads.subtitle': '像 Excel 一样直接编辑的表格，编辑后立即生效，无需保存。',
    'leads.addRow': '新增行',
    'leads.deleteRow': '删除选中行',
    'leads.export': '导出 CSV',
    'leads.rowCount': '共 {count} 条记录',
    'language.label': '语言',
  },
  en: {
    'leads.title': 'Customers / Leads',
    'leads.subtitle':
      'An Excel-like editable grid. Edits take effect instantly, no saving required.',
    'leads.addRow': 'Add Row',
    'leads.deleteRow': 'Delete Selected',
    'leads.export': 'Export CSV',
    'leads.rowCount': '{count} records',
    'language.label': 'Language',
  },
} as const

export type TranslationKey = keyof (typeof translations)['zh']

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, _setLanguage] = useState<Language>(
    () => (getCookie(LANGUAGE_COOKIE_NAME) as Language) || DEFAULT_LANGUAGE
  )

  useEffect(() => {
    document.documentElement.setAttribute('lang', language)
  }, [language])

  const setLanguage = (next: Language) => {
    _setLanguage(next)
    setCookie(LANGUAGE_COOKIE_NAME, next, LANGUAGE_COOKIE_MAX_AGE)
  }

  const t = (
    key: TranslationKey,
    vars?: Record<string, string | number>
  ): string => {
    let text: string = translations[language][key] ?? key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{${k}}`, String(v))
      }
    }
    return text
  }

  return (
    <LanguageContext value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
