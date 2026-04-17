import { redirect } from 'next/navigation';
import { getSession } from './session';

export async function requireUser() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return session;
}

export async function requireRole(role) {
  const session = await requireUser();

  if (session.role !== role) {
    redirect(session.role === 'ADMIN' ? '/admin' : '/user');
  }

  return session;
}