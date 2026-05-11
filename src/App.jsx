import React from 'react';
import { DeckA } from './nasha/Rest.jsx';
import { useTweaks } from './tweaks/TweaksPanel.jsx';

const systemPrefersDark =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

const TWEAKS_DEFAULTS = {
  accent: '#c2ff00',
  density: 'comfy',
  showTicker: true,
  showMixer: true,
  theme: systemPrefersDark ? 'dark' : 'light',
  variant: 'minimal',
};

export default function App() {
  const [tweaks, setTweak] = useTweaks(TWEAKS_DEFAULTS);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent', tweaks.accent);
    document.documentElement.setAttribute('data-theme', tweaks.theme || 'dark');
  }, [tweaks.accent, tweaks.theme]);

  return <DeckA tweaks={{ ...tweaks, __setTheme: (v) => setTweak('theme', v) }} />;
}
