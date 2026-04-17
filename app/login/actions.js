"use server";

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { createSession } from '@/lib/session';

export async function loginAction(previousState, formData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    return { error: 'Please enter username and password.' }
  }

  const user = await prisma.user.findUnique({
    where: { username: username }
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: 'Login incorrect' };
  }

  await createSession(user);
  redirect(user.role === 'ADMIN' ? '/admin' : '/user');
}