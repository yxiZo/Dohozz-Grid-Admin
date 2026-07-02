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

type BrandDef = {
  label: string
  /** Path under /brands when an official SVG asset exists. */
  src?: string
  /** Monogram background used when no official asset is available. */
  bg?: string
  /** Monogram foreground (defaults to white). */
  fg?: string
}

const BRANDS: Record<Platform, BrandDef> = {
  tiktok: { label: 'TikTok', src: '/brands/tiktok.svg' },
  instagram: { label: 'Instagram', src: '/brands/instagram.svg' },
  shopee: { label: 'Shopee', src: '/brands/shopee.svg' },
  whatsapp: { label: 'WhatsApp', src: '/brands/whatsapp.svg' },
  youtube: { label: 'YouTube', src: '/brands/youtube.svg' },
  facebook: { label: 'Facebook', src: '/brands/facebook.svg' },
  // No redistributable official mark available -> branded monogram fallback.
  lazada: { label: 'Lazada', bg: '#0F146D', fg: '#F57224' },
  tokopedia: { label: 'Tokopedia', bg: '#42B549' },
}

export const PLATFORMS = Object.keys(BRANDS) as Platform[]

export function platformLabel(platform: Platform): string {
  return BRANDS[platform]?.label ?? platform
}

type PlatformLogoProps = {
  platform: Platform
  className?: string
  /** Pixel size of the square logo. Defaults to 20. */
  size?: number
  title?: string
}

export function PlatformLogo({
  platform,
  className,
  size = 20,
  title,
}: PlatformLogoProps) {
  const brand = BRANDS[platform]
  const label = title ?? brand?.label ?? platform

  if (brand?.src) {
    return (
      <img
        src={brand.src}
        alt={`${label} logo`}
        width={size}
        height={size}
        loading='lazy'
        className={cn('inline-block object-contain', className)}
        style={{ width: size, height: size }}
      />
    )
  }

  // Monogram fallback for platforms without an official asset.
  return (
    <span
      role='img'
      aria-label={`${label} logo`}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-bold leading-none',
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: brand?.bg ?? 'var(--muted)',
        color: brand?.fg ?? '#fff',
        fontSize: Math.round(size * 0.55),
      }}
    >
      {label.charAt(0).toUpperCase()}
    </span>
  )
}
