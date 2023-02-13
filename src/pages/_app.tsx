import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { TooltipProvider, Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TooltipProvider>
      <Component {...pageProps} />
    </TooltipProvider>
  )
}
