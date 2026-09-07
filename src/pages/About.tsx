import { ArrowUpRight, Code2, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { portfolio, github, linkedin } from '../lib/catalog';
export default function About() {
  const { t } = useTranslation();
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">{t('made')}</span>
        <h1>{t('aboutTitle')}</h1>
        <p className="wide-copy">{t('aboutText')}</p>
      </div>
      <section className="developer-panel">
        <div className="developer-monogram" aria-hidden="true">
          B
          <span>
            <Code2 size={28} />
          </span>
        </div>
        <div>
          <span className="eyebrow">SAY RITHY / BOBBY</span>
          <h2>{t('developerTitle')}</h2>
          <p className="location">
            <MapPin size={17} />
            {t('developerRole')}
          </p>
          <p>{t('developerText')}</p>
          <p>{t('developerFocus')}</p>
          <div className="tech-tags">
            {[
              'React',
              'TypeScript',
              'Vite',
              'Tailwind CSS',
              'Supabase',
              'Zustand',
            ].map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <div className="button-row">
            {[
              [portfolio, 'viewPortfolio'],
              [github, 'github'],
              [linkedin, 'linkedin'],
            ].map(([href, key]) => (
              <a
                key={key}
                className={
                  'button ' +
                  (key === 'viewPortfolio' ? 'primary' : 'secondary')
                }
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t(key)}
                <ArrowUpRight size={16} />
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
