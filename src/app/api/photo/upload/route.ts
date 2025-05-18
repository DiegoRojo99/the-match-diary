import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PrismaClient } from '@prisma/generated/client';
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('photo') as File;
  const matchVisitId = formData.get('visitId') as string;
  if (!file || !matchVisitId) {
    console.log('File:', file);
    console.log('MatchVisitId:', matchVisitId);
    return new Response('Missing photo or visitId', { status: 400 });
  }

  const fileName = `${user.id}/${matchVisitId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from('match-visit-photos')
    .upload(fileName, file);

  if (error) {
    return new Response(`Upload failed: ${error.message}`, { status: 500 });
  }

  const publicUrl = supabase.storage.from('match-visit-photos').getPublicUrl(fileName).data.publicUrl;
  const savedPhoto = await prisma.photo.create({
    data: {
      url: publicUrl,
      matchVisitId,
    },
  });

  return Response.json(savedPhoto);
}
