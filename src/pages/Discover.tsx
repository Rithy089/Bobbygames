import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import { culture, cultureAlt } from '../lib/culture';
export default function Discover() {
  const { t, i18n } = useTranslation();
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">{t('cultureEyebrow')}</span>
        <h1>{t('discover')}</h1>
        <p>{t('cultureText')}</p>
        <p className="illustration-note">{t('illustrationNote')}</p>
      </div>
      <div className="culture-grid">
        {culture.map((c, i) => {
          return (
            <article key={c.id} className="culture-card">
              <figure className="culture-picture">
                <img
                  src={`/discover/${c.id}-960.webp`}
                  srcSet={`/discover/${c.id}-480.webp 480w, /discover/${c.id}-960.webp 960w`}
                  sizes="(max-width: 1000px) 92vw, 42vw"
                  width="960"
                  height="640"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  alt={cultureAlt[c.id][i18n.language === 'km' ? 'km' : 'en']}
                />
                <figcaption>{t('originalIllustration')}</figcaption>
              </figure>
              <div className="card-body">
                <h2>{c.en.title}</h2>
                <h3 lang="km">{c.km.title}</h3>
                <p lang="en">{c.en.description}</p>
                <p lang="km">{c.km.description}</p>
                <a
                  className="text-link"
                  href={c.source}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('source')}
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </article>
          );
        })}
      </div>
      <p className="small muted section">{t('translationNote')}</p>
    </>
  );
}
