import { UnsplashPhoto } from '@/lib/unsplash'

interface UnsplashCreditProps {
  photo: UnsplashPhoto
  /** 'hero' = bottom-right overlay on full-bleed images, 'card' = below image */
  variant?: 'hero' | 'card'
}

export default function UnsplashCredit({ photo, variant = 'hero' }: UnsplashCreditProps) {
  if (variant === 'hero') {
    return (
      <span className="absolute bottom-3 right-4 z-10" style={{ display: 'block' }}>
        <span style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.45)' }}>
          Photo{' '}
          <a
            href={photo.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="unsplash-credit-link"
            style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}
          >
            {photo.photographerName}
          </a>
          {' / '}
          <a
            href={`https://unsplash.com?utm_source=joie_oukala&utm_medium=referral`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}
          >
            Unsplash
          </a>
        </span>
      </span>
    )
  }

  // card variant — tiny text below image (must use <span> not <p> — rendered inside a <Link>/<a>)
  return (
    <span style={{ display: 'block', fontSize: '0.56rem', letterSpacing: '0.03em', color: '#9ca3af', textAlign: 'right', marginTop: '2px', paddingRight: '2px' }}>
      <a
        href={photo.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'inherit', textDecoration: 'none' }}
        onClick={(e) => e.preventDefault()}
      >
        {photo.photographerName}
      </a>
      {' / '}
      <a
        href={`https://unsplash.com?utm_source=joie_oukala&utm_medium=referral`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'inherit', textDecoration: 'none' }}
        onClick={(e) => e.preventDefault()}
      >
        Unsplash
      </a>
    </span>
  )
}
