import Head from "next/head";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Penultimate Guitar</title>
      </Head>
      <p className="text-center">500 - Server error occured</p>
    </>
  );
}
