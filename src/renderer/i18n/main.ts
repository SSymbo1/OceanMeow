import { createI18n } from 'vue-i18n';
import zh from '@/renderer/i18n/lang/zh-CN';
import en from '@/renderer/i18n/lang/en-US';

const i18n = createI18n({
  locale: 'zh-CN',
  legacy: false,
  fallbackLocale: 'zh-CN',
  globalInjection: true,
  messages: {
    'zh-CN': zh,
    'en-US': en,
  },
});
export default i18n;
