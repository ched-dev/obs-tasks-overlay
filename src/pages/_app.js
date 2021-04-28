import '../styles/globals.css'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (document && document.body && location.hostname === 'localhost') {
      document.body.classList.add('bg-gray-900')
    }
  })
  return <Component {...pageProps} />
}

export default MyApp
