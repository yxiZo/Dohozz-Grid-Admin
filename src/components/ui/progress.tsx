import { cn } from '@/lib/utils'

type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: number
}

function Progress({ value = 0, className, ...props }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div
      role='progressbar'
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-muted',
        className
      )}
      {...props}
    >
      <div
        className='h-full rounded-full bg-primary transition-all'
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export { Progress }
