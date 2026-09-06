import {useTranslation} from 'react-i18next';export default function Player(){const {t}=useTranslation();return <div className="empty-state"><h1>{t('loading')}</h1></div>}
