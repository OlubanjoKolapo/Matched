/**
 * Shared gradients, fabric textures and print patterns for one avatar.
 * Ids are prefixed so several avatars can share a page.
 */
export function AvatarDefs({ uid }: { uid: string }) {
  return (
    <defs>
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
        <path d="M0 0 1.5 2 3 0M0 2 1.5 4 3 2" fill="none" stroke="#000" strokeOpacity="0.09" strokeWidth="0.5" />
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
