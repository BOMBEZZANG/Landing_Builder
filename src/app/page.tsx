import HomePage from '@/components/home/HomePage';
import { I18nProvider } from '@/components/i18n/I18nProvider';

export default function Home() {
  return (
    <I18nProvider>
      <HomePage />
    </I18nProvider>
  );
}