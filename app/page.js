import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        FlexiWork v1
      </p>
      <h1 className="mt-3 text-4xl font-bold text-slate-900">
        Coworking room booking system
      </h1>
      <p className="mt-4 text-slate-600">
        (Admin, Coworking user's features...)
      </p>
      <Link href="/login" className="mt-8 w-fit rounded bg-slate-950 px-4 py-4 text-white">Login</Link>
    </main>
  )
}