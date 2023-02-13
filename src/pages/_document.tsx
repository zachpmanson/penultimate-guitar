import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <body className="p-4">
        <Main className="max-w-[100%]" />
        <NextScript />
      </body>
    </Html>
  );
}
