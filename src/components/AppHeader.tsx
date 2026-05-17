import type { CopyStrings } from '../lib/copy'
import type { Language } from '../types'

type AppHeaderProps = {
  t: CopyStrings
  language: Language
  onLanguageChange: (language: Language) => void
}

export function AppHeader({ t, language, onLanguageChange }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="header-main">
        <div>
          <p className="micro-label">ScoreKeeper</p>
          <h1 className="header-title">{t.title}</h1>
        </div>
        <div className="inline-actions lang-switch">
          <button
            type="button"
            className={language === 'vi' ? 'button primary' : 'button ghost'}
            onClick={() => onLanguageChange('vi')}
          >
            VI
          </button>
          <button
            type="button"
            className={language === 'en' ? 'button primary' : 'button ghost'}
            onClick={() => onLanguageChange('en')}
          >
            EN
          </button>
        </div>
      </div>
      <p className="subtle header-subtitle">{t.subtitle}</p>
    </header>
  )
}
