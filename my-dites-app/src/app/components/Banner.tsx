'use client'
import React from 'react'

type BannerProps = {
    img: string
    alt?: string
}

const Banner: React.FC<BannerProps> = ({ img, alt }) => {
  return (
    <div className="w-full">
        <img src={img} alt={alt || "banner"} className="w-full h-40 object-cover" />
    </div>
  )
}

export default Banner
