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
        <stop offset="0" stopColor="#3a1a0c" stopOpacity="0.22" />
        <stop offset="0.12" stopColor="#3a1a0c" stopOpacity="0.06" />
        <stop offset="0.28" stopColor="#fff" stopOpacity="0.24" />
        <stop offset="0.44" stopColor="#fff" stopOpacity="0.06" />
        <stop offset="0.72" stopColor="#3a1a0c" stopOpacity="0.16" />
        <stop offset="1" stopColor="#2a1206" stopOpacity="0.42" />
      </linearGradient>
      <linearGradient id={`${uid}-cyl-cloth`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity="0.2" />
        <stop offset="0.15" stopColor="#000" stopOpacity="0.03" />
        <stop offset="0.32" stopColor="#fff" stopOpacity="0.18" />
        <stop offset="0.5" stopColor="#fff" stopOpacity="0.02" />
        <stop offset="0.78" stopColor="#000" stopOpacity="0.14" />
        <stop offset="1" stopColor="#000" stopOpacity="0.35" />
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
      {blur('blur-xs', 0.35)}

      {/* Soft form shading: light from the left, shadow on the right. */}
      <linearGradient id={`${uid}-shade`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
        <stop offset="0.42" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.68" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.24" />
      </linearGradient>
      <linearGradient id={`${uid}-drape`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity="0" />
        <stop offset="0.85" stopColor="#000" stopOpacity="0.06" />
        <stop offset="1" stopColor="#000" stopOpacity="0.14" />
      </linearGradient>

      {/* Edge highlight: a rim of light on the silhouette edge facing the key. */}
      <linearGradient id={`${uid}-edge-light`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
        <stop offset="0.12" stopColor="#fff" stopOpacity="0.06" />
        <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>

      {/* Ambient occlusion: soft darkening where layers overlap. */}
      <linearGradient id={`${uid}-ao`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity="0.2" />
        <stop offset="0.3" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </linearGradient>

      {/* Leather: anisotropic sheen and surface noise. */}
      <linearGradient id={`${uid}-tex-leather`} x1="0.1" x2="0.9" y1="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
        <stop offset="0.25" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.45" stopColor="#fff" stopOpacity="0.14" />
        <stop offset="0.65" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.85" stopColor="#fff" stopOpacity="0.08" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>

      {/* Denim: visible twill weave with warp/weft, fading highlights. */}
      <pattern id={`${uid}-tex-denim`} width="4" height="4" patternUnits="userSpaceOnUse">
        <path d="M0 4 4 0" stroke="#000" strokeOpacity="0.12" strokeWidth="0.65" />
        <path d="M-1 1 1 -1M3 5 5 3" stroke="#000" strokeOpacity="0.06" strokeWidth="0.4" />
        <path d="M2 4 4 2" stroke="#fff" strokeOpacity="0.08" strokeWidth="0.35" />
        <path d="M0 2 2 0" stroke="#fff" strokeOpacity="0.05" strokeWidth="0.3" />
        <circle cx="1" cy="3" r="0.15" fill="#000" fillOpacity="0.04" />
        <circle cx="3" cy="1" r="0.15" fill="#fff" fillOpacity="0.03" />
      </pattern>

      {/* Knit: interlocking V stitches with row rhythm. */}
      <pattern id={`${uid}-tex-knit`} width="4" height="5" patternUnits="userSpaceOnUse">
        <path d="M0.3 0.4 2 2.6 3.7 0.4" fill="none" stroke="#000" strokeOpacity="0.06" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M0.3 2.9 2 5.1 3.7 2.9" fill="none" stroke="#000" strokeOpacity="0.06" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M0.3 0.4 2 2.6 3.7 0.4" fill="none" stroke="#fff" strokeOpacity="0.04" strokeWidth="0.3" transform="translate(0 0.15)" />
        <path d="M0.3 2.9 2 5.1 3.7 2.9" fill="none" stroke="#fff" strokeOpacity="0.04" strokeWidth="0.3" transform="translate(0 0.15)" />
      </pattern>

      {/* Twill: tighter diagonal with staggered float. */}
      <pattern id={`${uid}-tex-twill`} width="4" height="4" patternUnits="userSpaceOnUse">
        <path d="M0 4 4 0" stroke="#000" strokeOpacity="0.07" strokeWidth="0.55" />
        <path d="M-1 3 1 1M3 5 5 3" stroke="#000" strokeOpacity="0.04" strokeWidth="0.4" />
        <path d="M1 4 4 1" stroke="#fff" strokeOpacity="0.04" strokeWidth="0.3" />
      </pattern>

      {/* Suede: napped surface with directional micro-fibre. */}
      <pattern id={`${uid}-tex-suede`} width="4" height="4" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.4" fill="#000" fillOpacity="0.1" />
        <circle cx="3" cy="3" r="0.35" fill="#000" fillOpacity="0.08" />
        <circle cx="3" cy="0.8" r="0.2" fill="#fff" fillOpacity="0.06" />
        <circle cx="0.8" cy="3.2" r="0.25" fill="#fff" fillOpacity="0.05" />
        <path d="M0.5 2.2 1.5 2M2.5 0.5 3.5 0.3" stroke="#000" strokeOpacity="0.04" strokeWidth="0.2" />
      </pattern>

      {/* Cotton/jersey: very fine horizontal grain — for plain fabric garments. */}
      <pattern id={`${uid}-tex-cotton`} width="6" height="2" patternUnits="userSpaceOnUse">
        <path d="M0 1 6 1" stroke="#000" strokeOpacity="0.025" strokeWidth="0.3" />
        <path d="M0 0.4 6 0.4" stroke="#fff" strokeOpacity="0.02" strokeWidth="0.2" />
      </pattern>

      {/* Topstitch: visible stitch line for construction seams. */}
      <pattern id={`${uid}-stitch`} width="3" height="1" patternUnits="userSpaceOnUse">
        <rect x="0.3" y="0.35" width="1.6" height="0.3" rx="0.1" fill="#000" fillOpacity="0.25" />
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
