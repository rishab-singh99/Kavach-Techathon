import { useLanguageStore } from '../store/languageStore';

export default function LanguageSelector() {
    const { language, setLanguage } = useLanguageStore();

    return (
        <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'hi' | 'bn')}
            style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                width: 'auto',
            }}
        >
            <option value="en">EN</option>
            <option value="hi">हिं</option>
            <option value="bn">বাং</option>
        </select>
    );
}
