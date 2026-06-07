'use client'

interface Props {
  src: string
  alt: string
  style?: React.CSSProperties
}

export default function ArticleImage({ src, alt, style }: Props) {
  return (
    <img
      referrerPolicy="no-referrer"
      src={src}
      alt={alt}
      style={style}
      loading="eager"
      onError={(e: any) => { e.currentTarget.style.display = 'none' }}
    />
  )
}
