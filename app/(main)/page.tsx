import Hero from '@/components/Hero'
import { WatchTogether } from '@/components/WatchTogether'
import { Features } from '@/components/Features'
import React from 'react'

const page = () => {
  return (
    <div>
      <Hero />
      <WatchTogether />
      <Features />
    </div>
  )
}

export default page