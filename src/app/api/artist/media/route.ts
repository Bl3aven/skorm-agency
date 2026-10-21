import { NextResponse } from 'next/server';
import { getArtistSessionSlug } from '@/lib/artist-auth';
import { resolveMediaMetadata } from '@/lib/media-metadata';

export async function POST(request: Request) {
  if(request.headers.get('origin')!==new URL(request.url).origin) return NextResponse.json({error:'Origine invalide'},{status:403});
  if(!await getArtistSessionSlug()) return NextResponse.json({error:'Reconnecte-toi.'},{status:401});
  const body=await request.json().catch(()=>null);
  if(typeof body?.href!=='string' || body.href.length>2048) return NextResponse.json({error:'Lien invalide'},{status:400});
  try {return NextResponse.json(await resolveMediaMetadata(body.href));}
  catch {return NextResponse.json({error:'Ce lien ne peut pas être importé. Vérifie son adresse.'},{status:400});}
}
