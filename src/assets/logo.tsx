import { cn } from '@/lib/utils'

type LogoProps = React.ImgHTMLAttributes<HTMLImageElement>

export function Logo({ className, alt = 'DOHOZZ', ...props }: LogoProps) {
  return (
    <img
      src='/images/dohozz-logo.png'
      alt={alt}
      width={24}
      height={24}
      className={cn('size-6 object-contain', className)}
      {...props}
    />
  )
}
