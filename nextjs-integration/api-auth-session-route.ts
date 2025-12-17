// File: app/api/auth/session/route.ts
// Add this to your Next.js app

import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { getToken, userId } = await auth();

  if (!userId) {
    return Response.json({ token: null }, { status: 401 });
  }

  const token = await getToken();

  return Response.json({ token }, {
    headers: {
      'Access-Control-Allow-Origin': process.env.WORKER_URL || 'http://localhost:8787',
      'Access-Control-Allow-Credentials': 'true',
    }
  });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': process.env.WORKER_URL || 'http://localhost:8787',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    }
  });
}
