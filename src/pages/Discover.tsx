import { useTranslation } from 'react-i18next';
import {
  Landmark,
  Waves,
  Flower2,
  PanelsTopLeft,
  ArrowUpRight,
} from 'lucide-react';
import { culture } from '../lib/culture';
export default function Discover() {
  const { t } = useTranslation();
  const icons = [Landmark, Waves, Flower2, PanelsTopLeft];
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">{t('cultureEyebrow')}</span>
        <h1>{t('discover')}</h1>
        <p>{t('cultureText')}</p>
      </div>
      <div className="culture-grid">
        {culture.map((c, i) => {
          const Icon = icons[i % icons.length];
          return (
            <article key={c.id} className="culture-card">
              <div className={'culture-art tone-' + i} aria-hidden="true">
                <Icon size={62} strokeWidth={1} />
                <span>0{i + 1}</span>
              </div>
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
                  UNESCO · {t('source')}
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
