import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="eyebrow">Nothing here.</p>
      <h1>404</h1>
      <Link href="/">Back to Gabe’s dot net!</Link>
    </main>
  );
}
