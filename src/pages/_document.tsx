import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head></Head>
      <body className="p-4 overflow-x-hidden text-black dark:text-gray-200">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
