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
    'creators.addRow': '新增达人',
    'creators.deleteRow': '删除选中行',
    'creators.export': '导出 CSV',
    'creators.rowCount': '共 {count} 位达人',
    'creators.outreach.title': '建联提报',
    'creators.outreach.subtitle':
      '达人建联与提报审核，悬浮查看达人卡片，点击达人可编辑完整信息。',
    'creators.samples.title': '寄样管理',
    'creators.samples.subtitle':
      '寄样进度与合作跟进，悬浮查看达人卡片，点击达人可编辑完整信息。',
    'creators.videos.title': '视频验收',
    'creators.videos.subtitle':
      '视频交付与履约验收，悬浮查看达人卡片，点击达人可编辑完整信息。',
    'language.label': '语言',
  },
  en: {
    'creators.addRow': 'Add Creator',
    'creators.deleteRow': 'Delete Selected',
    'creators.export': 'Export CSV',
    'creators.rowCount': '{count} creators',
    'creators.outreach.title': 'Outreach & Submission',
    'creators.outreach.subtitle':
      'Creator outreach and submission review. Hover to preview the creator card, click to edit full details.',
    'creators.samples.title': 'Sample Management',
    'creators.samples.subtitle':
      'Track sampling progress and collaboration. Hover to preview the creator card, click to edit full details.',
    'creators.videos.title': 'Video Verification',
    'creators.videos.subtitle':
      'Video delivery and fulfillment review. Hover to preview the creator card, click to edit full details.',
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
