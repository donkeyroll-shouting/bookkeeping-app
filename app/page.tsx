import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-6xl">
          Shouting & Jiali Bookkeeping
        </h1>
        <Link href="/login">
          <Button size="lg">Login</Button>
        </Link>
      </main>
    </div>
  );
}
