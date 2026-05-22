/* Tweaks app for Les Marines d'Hélios */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "sable-marine",
  "fontPair": "cormorant-manrope",
  "cardStyle": "overlay",
  "heroLayout": "left"
}/*EDITMODE-END*/;

function MHTweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply theme whenever t changes
  React.useEffect(() => {
    window.MH.saveTheme(t);
    window.MH.applyTheme(t);
  }, [t]);

  const paletteOptions = Object.keys(window.MH.PALETTES);
  const fontOptions = Object.keys(window.MH.FONTS);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Palette" />
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {paletteOptions.map(key => {
          const p = window.MH.PALETTES[key];
          const isActive = t.palette === key;
          return (
            <button
              key={key}
              onClick={() => setTweak('palette', key)}
              style={{
                display:'flex',alignItems:'center',gap:10,
                padding:'8px 10px',borderRadius:8,
                border: isActive ? '1px solid rgba(41,38,27,0.6)' : '1px solid rgba(41,38,27,0.12)',
                background: isActive ? 'rgba(41,38,27,0.06)' : 'transparent',
                cursor:'default',textAlign:'left',font:'inherit',color:'inherit'
              }}>
              <span style={{display:'flex',gap:0}}>
                <span style={{width:14,height:14,borderRadius:'50% 0 0 50%',background:p.vars['--ink']}} />
                <span style={{width:14,height:14,background:p.vars['--cream']}} />
                <span style={{width:14,height:14,borderRadius:'0 50% 50% 0',background:p.vars['--terracotta']}} />
              </span>
              <span style={{fontWeight:500}}>{p.label}</span>
            </button>
          );
        })}
      </div>

      <TweakSection label="Typographie" />
      <TweakSelect
        label="Paire"
        value={t.fontPair}
        options={fontOptions.map(k => ({ value: k, label: window.MH.FONTS[k].label }))}
        onChange={(v) => setTweak('fontPair', v)}
      />

      <TweakSection label="Style des cartes (maisons)" />
      <TweakRadio
        label="Style"
        value={t.cardStyle}
        options={[
          { value: 'overlay', label: 'Overlay' },
          { value: 'flat', label: 'Flat' },
          { value: 'bordered', label: 'Bordée' }
        ]}
        onChange={(v) => setTweak('cardStyle', v)}
      />

      <TweakSection label="Layout du hero" />
      <TweakRadio
        label="Alignement"
        value={t.heroLayout}
        options={[
          { value: 'left', label: 'Aligné' },
          { value: 'centered', label: 'Centré' }
        ]}
        onChange={(v) => setTweak('heroLayout', v)}
      />

      <TweakSection label="Aperçu" />
      <div style={{fontSize:11,color:'rgba(41,38,27,0.6)',lineHeight:1.5}}>
        Les changements s'appliquent à toutes les pages (palette, typo).
        Le style des cartes et la mise en page du hero ne s'appliquent
        qu'aux pages concernées.
      </div>
    </TweaksPanel>
  );
}

const __root = document.getElementById('mh-tweaks-root');
ReactDOM.createRoot(__root).render(<MHTweaksApp />);
