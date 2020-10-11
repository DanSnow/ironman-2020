import React, { useEffect, useState } from 'react'
// import BlurHash from './BlurHash'

export function Image({ img }) {
  if (!img.url) {
    return <div>Loading...</div>
    // return <BlurHash height={img.height} width={img.width} hash={img.hash} />
  }

  const { url } = img
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const img = document.createElement('img')
    img.addEventListener('load', () => setReady(true))
    img.src = url
  }, [url])

  if (!ready) {
    return <div>Loading...</div>
    // return <BlurHash height={img.height} width={img.width} hash={img.hash} />
  }

  return <img src={img.url} />
}
