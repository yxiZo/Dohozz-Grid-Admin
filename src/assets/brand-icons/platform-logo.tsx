import { cn } from '@/lib/utils'

/**
 * Third-party platform logos used across DOHOZZ Admin (TikTok, Shopee, etc.).
 *
 * Brand marks with an official asset are rendered from the colored SVGs saved
 * in `public/brands`. Platforms without a redistributable official mark fall
 * back to a tasteful brand-colored monogram so the UI stays consistent.
 *
 * NOTE: These are third-party trademarks owned by their respective companies.
 * Review each brand's usage guidelines before shipping to production.
 *
 * Everyday UI icons (chevrons, menus, actions) should use `lucide-react`,
 * not this component.
 */
export type Platform =
  | 'tiktok'
  | 'instagram'
  | 'shopee'
  | 'whatsapp'
  | 'youtube'
  | 'facebook'
  | 'lazada'
  | 'tokopedia'

/** How the logo is presented. */
export type PlatformLogoVariant = 'bare' | 'chip'

type BrandDef = {
  label: string
  /** Canonical brand color, used to tint the chip background. */
  color: string
  /** Path under /brands when an official SVG asset exists. */
  src?: string
  /** Monogram foreground (defaults to white) for asset-less brands. */
  fg?: string
}

const BRANDS: Record<Platform, BrandDef> = {
  tiktok: { label: 'TikTok', color: '#010101', src: '/brands/tiktok.svg' },
  instagram: {
    label: 'Instagram',
    color: '#E4405F',
    src: '/brands/instagram.svg',
  },
  shopee: { label: 'Shopee', color: '#EE4D2D', src: '/brands/shopee.svg' },
  whatsapp: { label: 'WhatsApp', color: '#25D366', src: '/brands/whatsapp.svg' },
  youtube: { label: 'YouTube', color: '#FF0000', src: '/brands/youtube.svg' },
  facebook: { label: 'Facebook', color: '#1877F2', src: '/brands/facebook.svg' },
  // No redistributable official mark available -> branded monogram fallback.
  lazada: { label: 'Lazada', color: '#0F146D', fg: '#F57224' },
  tokopedia: { label: 'Tokopedia', color: '#42B549' },
}

export const PLATFORMS = Object.keys(BRANDS) as Platform[]

export function platformLabel(platform: Platform): string {
  return BRANDS[platform]?.label ?? platform
}

type PlatformLogoProps = {
  platform: Platform
  className?: string
  /** Pixel size of the square logo (or chip). Defaults to 20. */
  size?: number
  /** `bare` shows just the mark; `chip` wraps it in a tinted rounded tile. */
  variant?: PlatformLogoVariant
  title?: string
}

export function PlatformLogo({
  platform,
  className,
  size = 20,
  variant = 'bare',
  title,
}: PlatformLogoProps) {
  const brand = BRANDS[platform]
  const label = title ?? brand?.label ?? platform
  const hasAsset = Boolean(brand?.src)

  // The visual mark: either the official SVG asset or a monogram letter.
  const mark = hasAsset ? (
    <img
      src={brand.src}
      alt={`${label} logo`}
      width={variant === 'chip' ? Math.round(size * 0.64) : size}
      height={variant === 'chip' ? Math.round(size * 0.64) : size}
      loading='lazy'
      className='inline-block object-contain'
      style={
        variant === 'chip'
          ? { width: Math.round(size * 0.64), height: Math.round(size * 0.64) }
          : { width: size, height: size }
      }
    />
  ) : (
    <span
      className='font-bold leading-none'
      style={{
        color: variant === 'chip' ? brand?.color : (brand?.fg ?? '#fff'),
        fontSize: Math.round(size * (variant === 'chip' ? 0.5 : 0.55)),
      }}
    >
      {label.charAt(0).toUpperCase()}
    </span>
  )

  // Bare monogram (no chip) still needs its own solid background to be legible.
  if (variant === 'bare' && !hasAsset) {
    return (
      <span
        role='img'
        aria-label={`${label} logo`}
        title={label}
        className={cn(
          'inline-flex items-center justify-center rounded-md',
          className
        )}
        style={{ width: size, height: size, backgroundColor: brand?.color }}
      >
        {mark}
      </span>
    )
  }

  if (variant === 'bare') {
    return (
      <span
        role='img'
        aria-label={`${label} logo`}
        title={label}
        className={cn('inline-flex shrink-0', className)}
        style={{ width: size, height: size }}
      >
        {mark}
      </span>
    )
  }

  // Chip: rounded tile with a soft brand-tinted background + subtle ring.
  return (
    <span
      role='img'
      aria-label={`${label} logo`}
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg ring-1 ring-inset',
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: `color-mix(in srgb, ${brand?.color} 14%, transparent)`,
        // Ring uses the brand color at low opacity for a crisp edge.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ['--tw-ring-color' as any]: `color-mix(in srgb, ${brand?.color} 28%, transparent)`,
      }}
    >
      {mark}
    </span>
  )
}
