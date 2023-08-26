import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Login() {
  //   const router = useRouter();

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <h1 className="text-center text-2xl">Login</h1>
      <Link className="text-center text-gray-400 mb-4 font-extralight">
        Login with Mastodon
      </Link>
    </>
  );
}
