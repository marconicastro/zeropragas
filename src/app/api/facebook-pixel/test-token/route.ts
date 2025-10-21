import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verificar se o token está configurado
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    
    if (!accessToken) {
      return NextResponse.json({
        valid: false,
        message: 'Token do Facebook não configurado',
        error: 'FACEBOOK_ACCESS_TOKEN não encontrado no ambiente',
        fix: 'Adicione FACEBOOK_ACCESS_TOKEN ao seu arquivo .env'
      });
    }

    // Testar o token com uma requisição simples à API do Facebook
    try {
      const response = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (response.ok) {
        return NextResponse.json({
          valid: true,
          message: 'Token do Facebook está válido',
          details: {
            id: result.id,
            name: result.name,
            tokenPreview: accessToken.substring(0, 20) + '...'
          }
        });
      } else {
        return NextResponse.json({
          valid: false,
          message: 'Token do Facebook inválido',
          error: result.error,
          details: {
            code: result.error?.code,
            type: result.error?.type,
            message: result.error?.message
          }
        });
      }
    } catch (error) {
      return NextResponse.json({
        valid: false,
        message: 'Erro ao testar token do Facebook',
        error: error.message
      });
    }

  } catch (error) {
    return NextResponse.json({
      valid: false,
      message: 'Erro interno ao testar token',
      error: error.message
    });
  }
}