import * as React from 'react'
import Image from 'next/image'

const EcoFocusLogo: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Image src="/ecofocus-logo.svg" alt="EcoFocus" width={120} height={28} priority />
    </div>
  )
}

export default EcoFocusLogo
