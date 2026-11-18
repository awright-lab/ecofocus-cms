import Image from 'next/image'

export default function EcoFocusLogo() {
  return <div className="ef-brand-logo"><Image src="/brand/ecofocus-wordmark.webp" alt="EcoFocus Research" width={240} height={44} priority unoptimized /></div>
}
