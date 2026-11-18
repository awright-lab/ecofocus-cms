import Image from 'next/image'
import Link from 'next/link'

export default function WorkspaceNavBrand() {
  return <div className="ef-nav-brand">
    <Link href="/admin" aria-label="EcoFocus workspace home"><Image src="/brand/ecofocus-wordmark.webp" alt="EcoFocus Research" width={168} height={31} unoptimized /></Link>
    <p>CONTENT &amp; REPORTS</p>
    <a className="ef-nav-site" href="https://ecofocusresearch.com" target="_blank" rel="noopener noreferrer">View website <span aria-hidden="true">↗</span><span className="ef-sr-only"> (opens in a new tab)</span></a>
  </div>
}
