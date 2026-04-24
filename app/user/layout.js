import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { logoutAction } from '@/app/logout/actions';

export default async function UserLayout({ children }) {
  const session = await requireRole('USER');

  return (
    <div>
      <header className="bg-slate-800 p-2 flex text-white justify-between">
        <span className="font-bold flex-1">User Area</span>

        <nav className="flex space-x-4 justify-center items-center flex-1">
          <Link href="/user">Home</Link>
          <Link href="/user/search">Search</Link>
          <Link href="/user/profile">Profile</Link>
        </nav>

        <div className="flex space-x-2 items-center flex-1 justify-end">
          <span>Hi, {session.firstName} {session.lastName}.</span>
          <form action={logoutAction}>
            <button className="bg-slate-200 text-slate-800 text-xs px-2 py-1 rounded">Logout</button>
          </form>
        </div>
      </header>
      <main className="p-4">{children}</main>
    </div >
  );
}