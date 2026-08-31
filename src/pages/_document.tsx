import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/*
          Edge logout navigates to a Basic-auth URL that embeds the reserved
          `guest` credential so the browser signs out silently (see profile.tsx
          edgeLogout). That leaves the credentials in the URL, and the browser
          refuses to construct a relative fetch against a base URI that carries
          userinfo ("URL with embedded credentials" TypeError breaks every data
          request after logout). Turn any userinfo-bearing page into a clean `/`
          navigation the instant it parses — before any hydration fetch — so
          the base URI is clean again. The browser has already told Caddy it is
          `guest` (= anonymous) and keeps resending that Basic credential, so
          the reload stays signed out.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var u=document.baseURI||"";var a=u.indexOf("@");if(a<0)return;var at=u.indexOf("//");if(a<=at)return;var sl=u.indexOf("/",at+2);if(sl>=0&&sl<a)return;window.location.replace(window.location.protocol+"//"+window.location.host+"/");}catch(e){}})();`,
          }}
        />
      </Head>
      <body className="p-4 overflow-x-hidden text-black dark:text-gray-200">
        <Main />
        <NextScript />
        {/* Portal root for popups that must escape local stacking contexts */}
        <div id="portal-root" />
      </body>
    </Html>
  );
}
