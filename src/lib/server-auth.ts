import { NextRequest } from 'next/server';
import { supabaseClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

export async function getUserFromRequest(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabaseClient.auth.getUser(token);
  if (error || !user) return null;
  return user.id;
}

export async function getUserDataFromRequest(request: NextRequest): Promise<User | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabaseClient.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function ensureUserExists(userData: User): Promise<void> {
  await prisma.user.upsert({
    where: { id: userData.id },
    update: { email: userData.email!, updatedAt: new Date() },
    create: {
      id: userData.id,
      email: userData.email!,
      displayName: userData.user_metadata?.display_name || userData.email?.split('@')[0],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
}
