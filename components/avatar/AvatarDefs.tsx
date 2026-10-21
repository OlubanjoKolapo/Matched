/**
 * Shared gradients, fabric textures and print patterns for one avatar.
 * Ids are prefixed so several avatars can share a page.
 */
export function AvatarDefs({ uid }: { uid: string }) {
  const blur = (id: string, sd: number) => (
    <filter id={`${uid}-${id}`} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
      <feGaussianBlur stdDeviation={sd} />
    </filter>
  );
  return (
    <defs>
      {/* Studio key light from the upper left: each limb reads as a rounded form. */}
      <linearGradient id={`${uid}-cyl-skin`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#3a1a0c" stopOpacity="0.2" />
        <stop offset="0.16" stopColor="#3a1a0c" stopOpacity="0.04" />
        <stop offset="0.34" stopColor="#fff" stopOpacity="0.2" />
        <stop offset="0.5" stopColor="#fff" stopOpacity="0.05" />
        <stop offset="0.78" stopColor="#3a1a0c" stopOpacity="0.14" />
        <stop offset="1" stopColor="#2a1206" stopOpacity="0.38" />
      </linearGradient>
      <linearGradient id={`${uid}-cyl-cloth`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity="0.16" />
        <stop offset="0.2" stopColor="#000" stopOpacity="0.02" />
        <stop offset="0.38" stopColor="#fff" stopOpacity="0.1" />
        <stop offset="0.56" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.82" stopColor="#000" stopOpacity="0.12" />
        <stop offset="1" stopColor="#000" stopOpacity="0.3" />
      </linearGradient>
      <radialGradient id={`${uid}-sphere`} cx="0.36" cy="0.3" r="0.78">
        <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
        <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.8" stopColor="#2a1206" stopOpacity="0.14" />
        <stop offset="1" stopColor="#2a1206" stopOpacity="0.36" />
      </radialGradient>
      <linearGradient id={`${uid}-hair-sheen`} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0.18" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.3" stopColor="#fff" stopOpacity="0.2" />
        <stop offset="0.4" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <pattern id={`${uid}-hair-strands`} width="3" height="18" patternUnits="userSpaceOnUse">
        <path d="M0.8 0c0.5 6 -0.3 12 0.2 18M2.2 0c-0.4 7 0.4 11 -0.1 18" fill="none" stroke="#000" strokeOpacity="0.09" strokeWidth="0.3" />
        <path d="M1.5 0c0.3 6 -0.2 12 0.2 18" fill="none" stroke="#fff" strokeOpacity="0.06" strokeWidth="0.25" />
      </pattern>
      {blur('blur-s', 0.6)}
      {blur('blur-m', 1.5)}
      {blur('blur-l', 3)}
      {blur('blur-floor', 7)}

      {/* Soft form shading: light from the left, shadow on the right. */}
      <linearGradient id={`${uid}-shade`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
        <stop offset="0.42" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.68" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.22" />
      </linearGradient>
      <linearGradient id={`${uid}-drape`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id={`${uid}-tex-leather`} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
        <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.6" stopColor="#fff" stopOpacity="0.1" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>

      <pattern id={`${uid}-tex-denim`} width="3" height="3" patternUnits="userSpaceOnUse">
        <path d="M0 3 3 0" stroke="#000" strokeOpacity="0.14" strokeWidth="0.7" />
        <path d="M-1 1 1 -1M2 4 4 2" stroke="#fff" strokeOpacity="0.08" strokeWidth="0.5" />
      </pattern>
      <pattern id={`${uid}-tex-knit`} width="3" height="4" patternUnits="userSpaceOnUse">
        <path d="M0 0 1.5 2 3 0M0 2 1.5 4 3 2" fill="none" stroke="#000" strokeOpacity="0.05" strokeWidth="0.45" />
      </pattern>
      <pattern id={`${uid}-tex-twill`} width="2.5" height="2.5" patternUnits="userSpaceOnUse">
        <path d="M0 2.5 2.5 0" stroke="#000" strokeOpacity="0.07" strokeWidth="0.5" />
      </pattern>
      <pattern id={`${uid}-tex-suede`} width="3" height="3" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.45" fill="#000" fillOpacity="0.14" />
        <circle cx="2.4" cy="2.2" r="0.35" fill="#fff" fillOpacity="0.08" />
      </pattern>

      {(['dark', 'light'] as const).map((ink) => {
        const color = ink === 'dark' ? '#000' : '#fff';
        const opacity = ink === 'dark' ? 0.26 : 0.3;
        return (
          <g key={ink}>
            <pattern id={`${uid}-pat-stripe-${ink}`} width="8" height="7" patternUnits="userSpaceOnUse">
              <rect width="8" height="2.4" fill={color} fillOpacity={opacity} />
            </pattern>
            <pattern id={`${uid}-pat-check-${ink}`} width="9" height="9" patternUnits="userSpaceOnUse">
              <rect width="9" height="3" fill={color} fillOpacity={opacity * 0.8} />
              <rect width="3" height="9" fill={color} fillOpacity={opacity * 0.8} />
            </pattern>
            <pattern id={`${uid}-pat-print-${ink}`} width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.4" fill={color} fillOpacity={opacity} />
              <circle cx="8" cy="8" r="1" fill={color} fillOpacity={opacity} />
            </pattern>
          </g>
        );
      })}
    </defs>
  );
}
