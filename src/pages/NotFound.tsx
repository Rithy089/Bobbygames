import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="empty-state">
      <span className="error-number">404</span>
      <h1>{t('notFound')}</h1>
      <p>{t('notFoundText')}</p>
      <Link className="button primary" to="/">
        {t('returnHome')}
      </Link>
    </div>
  );
}
