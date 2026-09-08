import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useAudioStatus } from '../lib/audio-status';
import { usePortal } from '../lib/store';
export default function AudioSettings() {
  const { t } = useTranslation();
  const status = useAudioStatus((s) => s.status);
  const enable = useAudioStatus((s) => s.enable);
  const audio = usePortal((s) => s.audio);
  const setAudio = usePortal((s) => s.setAudio);
  return (
    <div className="audio-settings">
      {(['sound', 'music', 'effects'] as const).map((key) => (
        <div key={key} className="setting-line">
          <span>{t(key)}</span>
          <Switch
            aria-label={t(key)}
            checked={audio[key]}
            onCheckedChange={(v) => setAudio({ [key]: v })}
          />
        </div>
      ))}
      {(['volume', 'musicVolume', 'effectsVolume'] as const).map((key) => (
        <div key={key} className="setting-line">
          <span id={key + '-label'}>{t(key)}</span>
          <Slider
            aria-labelledby={key + '-label'}
            className="volume-slider"
            value={[audio[key] * 100]}
            min={0}
            max={100}
            step={5}
            onValueChange={(v) =>
              setAudio({ [key]: (Array.isArray(v) ? v[0] : v) / 100 })
            }
          />
        </div>
      ))}
      {enable && !audio.music && <p className="small">{t('musicOffNotice')}</p>}
      {enable && status !== 'ready' && status !== 'idle' && (
        <div role="status">
          <p>{t('audioStatus_' + status)}</p>
          <button className="button secondary" onClick={enable}>
            {t('enableSound')}
          </button>
        </div>
      )}
    </div>
  );
}
