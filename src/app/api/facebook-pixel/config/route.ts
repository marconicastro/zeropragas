import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, pixelId } = await request.json();
    
    if (!accessToken || !pixelId) {
      return NextResponse.json({
        success: false,
        error: 'Access token e pixel ID são obrigatórios'
      }, { status: 400 });
    }

    console.log('💾 Salvando configuração do Facebook...');
    console.log('Pixel ID:', pixelId);

    // Atualizar o arquivo .env
    const envPath = join(process.cwd(), '.env');
    let envContent = '';

    if (existsSync(envPath)) {
      envContent = readFileSync(envPath, 'utf-8');
    }

    // Adicionar ou atualizar as variáveis de ambiente
    const lines = envContent.split('\n');
    const newLines = [];

    let hasDatabaseUrl = false;
    let hasFacebookToken = false;
    let hasFacebookPixelId = false;

    for (const line of lines) {
      if (line.startsWith('DATABASE_URL=')) {
        hasDatabaseUrl = true;
        newLines.push(line);
      } else if (line.startsWith('FACEBOOK_ACCESS_TOKEN=')) {
        hasFacebookToken = true;
        newLines.push(`FACEBOOK_ACCESS_TOKEN=${accessToken}`);
      } else if (line.startsWith('FACEBOOK_PIXEL_ID=')) {
        hasFacebookPixelId = true;
        newLines.push(`FACEBOOK_PIXEL_ID=${pixelId}`);
      } else if (line.trim() !== '') {
        newLines.push(line);
      }
    }

    // Adicionar variáveis que não existem
    if (!hasDatabaseUrl) {
      newLines.push('DATABASE_URL=file:/home/z/my-project/db/custom.db');
    }
    if (!hasFacebookToken) {
      newLines.push(`FACEBOOK_ACCESS_TOKEN=${accessToken}`);
    }
    if (!hasFacebookPixelId) {
      newLines.push(`FACEBOOK_PIXEL_ID=${pixelId}`);
    }

    // Escrever o arquivo atualizado
    writeFileSync(envPath, newLines.join('\n') + '\n');

    // Atualizar também o metaConfig.ts para garantir consistência
    const metaConfigPath = join(process.cwd(), 'src/lib/metaConfig.ts');
    if (existsSync(metaConfigPath)) {
      let metaConfigContent = readFileSync(metaConfigPath, 'utf-8');
      
      // Atualizar o PIXEL_ID no metaConfig
      metaConfigContent = metaConfigContent.replace(
        /PIXEL_ID: '[^']*'/,
        `PIXEL_ID: '${pixelId}'`
      );
      
      // Habilitar Conversions API
      metaConfigContent = metaConfigContent.replace(
        /enableConversionsAPI: false/,
        'enableConversionsAPI: true'
      );
      
      writeFileSync(metaConfigPath, metaConfigContent);
    }

    console.log('✅ Configuração salva com sucesso!');

    return NextResponse.json({
      success: true,
      message: 'Configuração salva com sucesso',
      pixelId: pixelId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao salvar configuração:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno no servidor',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}