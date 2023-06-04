import { Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head></Head>
      <body className="p-4">
        <Main />
        <NextScript />
        <div className="container">
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-2Q5B9DT8HJ"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-2Q5B9DT8HJ');
            `}
          </Script>
        </div>
      </body>
    </Html>
  );
}
