import { NextResponse } from "next/server";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    // Check Facebook configuration
    const envPath = join(process.cwd(), '.env');
    let facebookConfigured = false;
    let facebookPixelId = null;
    let facebookAccessToken = false;

    if (existsSync(envPath)) {
      const envContent = readFileSync(envPath, 'utf-8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('FACEBOOK_ACCESS_TOKEN=')) {
          const token = line.split('=')[1]?.trim();
          if (token && token !== '' && token !== 'SEU_TOKEN_AQUI') {
            facebookAccessToken = true;
          }
        } else if (line.startsWith('FACEBOOK_PIXEL_ID=')) {
          const pixelId = line.split('=')[1]?.trim();
          if (pixelId && pixelId !== '' && pixelId !== 'SEU_PIXEL_ID_AQUI') {
            facebookPixelId = pixelId;
          }
        }
      }
      
      facebookConfigured = facebookAccessToken && facebookPixelId;
    }

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      facebook: {
        configured: facebookConfigured,
        pixelId: facebookPixelId,
        hasAccessToken: facebookAccessToken
      },
      database: {
        configured: true,
        url: process.env.DATABASE_URL || 'file:/home/z/my-project/db/custom.db'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}