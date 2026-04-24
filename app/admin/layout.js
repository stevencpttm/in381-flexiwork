import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { logoutAction } from '@/app/logout/actions';

export default async function AdminLayout({ children }) {
  const session = await requireRole('ADMIN');

  return (
    <div>
      <header>
        Hi, {session.firstName} {session.lastName}.

        <nav>
          <Link href="/admin">Home</Link>
          <Link href="/admin/users">Users</Link>
          <Link href="/admin/rooms">Rooms</Link>
          <form action={logoutAction}>
            <button>Logout</button>
          </form>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}