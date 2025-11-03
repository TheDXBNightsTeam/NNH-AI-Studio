"use client";
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const LanguageSwitcher = () => {
  const router = useRouter();
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    router.replace(router.asPath, undefined, { locale: lng });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px', gap: '8px' }}>
      <button
        onClick={() => changeLanguage('en')}
        style={{ fontWeight: i18n.language === 'en' ? 'bold' : 'normal' }}
      >
        English
      </button>
      <button
        onClick={() => changeLanguage('ar')}
        style={{ fontWeight: i18n.language === 'ar' ? 'bold' : 'normal' }}
      >
        العربية
      </button>
    </div>
  );
};

export default LanguageSwitcher;
