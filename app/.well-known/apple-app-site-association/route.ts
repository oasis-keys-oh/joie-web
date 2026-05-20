import { NextResponse } from 'next/server'

const AASA = {
  applinks: {
    apps: [],
    details: [
      {
        appID: 'KX3A47ZKUZ.com.oasiskeys.joie',
        paths: ['/join/*'],
      },
    ],
  },
}

export function GET() {
  return new NextResponse(JSON.stringify(AASA), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
