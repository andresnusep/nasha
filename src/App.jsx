import React from 'react';
import { DeckA } from './nasha/Rest.jsx';
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle } from './tweaks/TweaksPanel.jsx';

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

  return (
    <>
      <DeckA tweaks={{ ...tweaks, __setTheme: (v) => setTweak('theme', v) }} />
      <TweaksPanel title="Tweaks">
        <TweakSection label="Layout">
          <TweakRadio label="Home variant" value={tweaks.variant || 'full'} onChange={(v) => setTweak('variant', v)}
            options={[
              { value: 'full', label: 'Full deck' },
              { value: 'minimal', label: 'Minimal' },
            ]} />
        </TweakSection>
        <TweakSection label="Theme">
          <TweakRadio label="Mode" value={tweaks.theme || 'dark'} onChange={(v) => setTweak('theme', v)}
            options={[
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
            ]} />
        </TweakSection>
        <TweakSection label="Palette">
          <TweakRadio label="Accent" value={tweaks.accent} onChange={(v) => setTweak('accent', v)}
            options={[
              { value: '#c2ff00', label: 'Lime' },
              { value: '#ff4d1a', label: 'Orange' },
              { value: '#ff3bd4', label: 'Magenta' },
              { value: '#a87bff', label: 'Lilac' },
              { value: '#00e0ff', label: 'Cyan' },
            ]} />
        </TweakSection>
        <TweakSection label="Density">
          <TweakRadio label="Density" value={tweaks.density} onChange={(v) => setTweak('density', v)}
            options={[
              { value: 'tight', label: 'Tight' },
              { value: 'comfy', label: 'Comfy' },
              { value: 'loose', label: 'Loose' },
            ]} />
          <TweakToggle label="Live ticker" value={tweaks.showTicker} onChange={(v) => setTweak('showTicker', v)} />
          <TweakToggle label="Home mixer block" value={tweaks.showMixer} onChange={(v) => setTweak('showMixer', v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}
