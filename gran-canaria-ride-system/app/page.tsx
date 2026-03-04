import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Welcome to Gran Canaria Ride System</h1>
      <p>This is the home page.</p>
      <p>
        <Link href="/rewards" className="text-blue-500 underline">
          View rewards
        </Link>
      </p>
    </main>
  );
}
