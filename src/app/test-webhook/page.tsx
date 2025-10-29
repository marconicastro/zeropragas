'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Bug } from 'lucide-react';

export default function TestWebhookPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState(`{
  "status": "approved",
  "customer_email": "cliente@example.com",
  "amount": "39.90",
  "transaction_id": "test_123456",
  "product_id": "hacr962"
}`);

  // 💰 Opções de valores dinâmicos para testes
  const dynamicTestValues = {
    base_product: "39.90",
    with_order_bump: "67.80",
    with_upsell: "97.70",
    premium_package: "127.60"
  };

  const testWebhook = async (endpoint: string) => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: testData,
      });

      const data = await response.json();
      setResult({
        status: response.status,
        ok: response.ok,
        data: data,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Teste de Webhook Allpes</h1>
          <p className="text-muted-foreground">
            Teste o webhook da Allpes com diferentes estruturas de dados
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Dados de Teste
            </CardTitle>
            <CardDescription>
              Modifique os dados abaixo para simular diferentes estruturas da Allpes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="testData">JSON de Teste:</Label>
              <Textarea
                id="testData"
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                className="font-mono text-sm"
                rows={8}
                placeholder="Insira o JSON para testar..."
              />
            </div>

            {/* 💰 Botões de Valores Dinâmicos */}
            <div>
              <Label className="text-sm font-medium mb-2 block">💰 Testar Valores Dinâmicos:</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newTestData = JSON.parse(testData);
                    newTestData.amount = dynamicTestValues.base_product;
                    setTestData(JSON.stringify(newTestData, null, 2));
                  }}
                  className="text-xs"
                >
                  Produto Base (R$ 39,90)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newTestData = JSON.parse(testData);
                    newTestData.amount = dynamicTestValues.with_order_bump;
                    setTestData(JSON.stringify(newTestData, null, 2));
                  }}
                  className="text-xs"
                >
                  + Order Bump (R$ 67,80)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newTestData = JSON.parse(testData);
                    newTestData.amount = dynamicTestValues.with_upsell;
                    setTestData(JSON.stringify(newTestData, null, 2));
                  }}
                  className="text-xs"
                >
                  + Upsell (R$ 97,70)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newTestData = JSON.parse(testData);
                    newTestData.amount = dynamicTestValues.premium_package;
                    setTestData(JSON.stringify(newTestData, null, 2));
                  }}
                  className="text-xs"
                >
                  Premium (R$ 127,60)
                </Button>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => testWebhook('/api/webhook-allpes')}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Testar Allpes
              </Button>

              <Button
                onClick={() => testWebhook('/api/webhook-cakto')}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Testar Cakto ✅
              </Button>

              <Button
                onClick={() => testWebhook('/api/debug-allpes')}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Bug className="h-4 w-4" />
                )}
                Debug Allpes
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Erro:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.ok ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Resultado do Teste
              </CardTitle>
              <CardDescription>
                Status: {result.status} {result.ok ? '✅' : '❌'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Exemplos de Estruturas</CardTitle>
            <CardDescription>
              Clique nos exemplos abaixo para testar diferentes estruturas de dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm font-medium text-green-600 mb-2">🏆 CAKTO - Estrutura Perfeita:</div>
            <Button
              variant="outline"
              onClick={() => setTestData(`{
  "secret": "12f4848f-35e9-41a8-8da4-1032642e3e89",
  "event": "purchase_approved",
  "data": {
    "id": "81b408ee-2a91-427d-80bd-226cbeae1fa0",
    "customer": {
      "name": "Example",
      "email": "cliente@example.com",
      "phone": "34999999999"
    },
    "amount": 39.90,
    "status": "paid",
    "product": {
      "name": "Sistema 4 Fases",
      "short_id": "hacr962"
    },
    "paymentMethod": "pix"
  }
}`)}
              className="w-full justify-start border-green-200 bg-green-50"
            >
              ✅ Cakto - Compra Aprovada (SECRET REAL)
            </Button>

            <Button
              variant="outline"
              onClick={() => setTestData(`{
  "secret": "12f4848f-35e9-41a8-8da4-1032642e3e89",
  "event": "checkout_abandonment",
  "data": {
    "offer": {
      "id": "hacr962",
      "name": "Sistema 4 Fases",
      "price": 39.90
    },
    "product": {
      "name": "Sistema 4 Fases",
      "short_id": "hacr962"
    },
    "customerName": "João Silva",
    "customerEmail": "joao@email.com",
    "customerCellphone": "34999999999",
    "checkoutUrl": "https://pay.cakto.com.br/hacr962_605077",
    "createdAt": "2024-08-22T11:37:31.083758-03:00"
  }
}`)}
              className="w-full justify-start border-blue-200 bg-blue-50"
            >
              🛒 Cakto - Abandono de Checkout (SECRET REAL)
            </Button>

            <Button
              variant="outline"
              onClick={() => setTestData(`{
  "secret": "12f4848f-35e9-41a8-8da4-1032642e3e89",
  "event": "purchase_refused",
  "data": {
    "id": "refused_123456",
    "customer": {
      "name": "Maria Santos",
      "email": "maria@email.com",
      "phone": "11999999999"
    },
    "amount": 39.90,
    "status": "refused",
    "product": {
      "name": "Sistema 4 Fases",
      "short_id": "hacr962"
    },
    "paymentMethod": "credit_card",
    "reason": "Cartão negado pelo banco"
  }
}`)}
              className="w-full justify-start border-red-200 bg-red-50"
            >
              ❌ Cakto - Compra Recusada (SECRET REAL)
            </Button>

            <div className="text-sm font-medium text-orange-600 mb-2 mt-4">🔧 ALLPES - Testes:</div>
            <Button
              variant="outline"
              onClick={() => setTestData(`{
  "status": "approved",
  "customer_email": "cliente@example.com",
  "amount": "39.90",
  "transaction_id": "test_123456",
  "product_id": "hacr962"
}`)}
              className="w-full justify-start"
            >
              Allpes - Estrutura Padrão (customer_email, amount)
            </Button>

            <Button
              variant="outline"
              onClick={() => setTestData(`{
  "status": "paid",
  "email": "user@test.com",
  "value": "39.90",
  "order_id": "order_789",
  "product_id": "hacr962"
}`)}
              className="w-full justify-start"
            >
              Allpes - Estrutura Alternativa (email, value, order_id)
            </Button>

            <Button
              variant="outline"
              onClick={() => setTestData(`{
  "status": "completed",
  "buyer_email": "comprador@site.com",
  "total": "39.90",
  "id": "payment_456",
  "product_id": "hacr962"
}`)}
              className="w-full justify-start"
            >
              Allpes - Estrutura Variante (buyer_email, total, id)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>URLs do Webhook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>🏆 Cakto Webhook (RECOMENDADO):</strong>
              <code className="block bg-green-50 p-2 rounded text-sm break-all border-green-200">
                https://maracujazeropragas.com/api/webhook-cakto
              </code>
            </div>
            <div>
              <strong>🔧 Allpes Webhook (legado):</strong>
              <code className="block bg-orange-50 p-2 rounded text-sm break-all border-orange-200">
                https://maracujazeropragas.com/api/webhook-allpes
              </code>
            </div>
            <div>
              <strong>🐛 Debug Allpes:</strong>
              <code className="block bg-gray-50 p-2 rounded text-sm break-all">
                https://maracujazeropragas.com/api/debug-allpes
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}