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
  "amount": "97.00",
  "transaction_id": "test_123456",
  "product_id": "339591"
}`);

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
                Testar Webhook Principal
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
                Testar Debug Webhook
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
            <Button
              variant="outline"
              onClick={() => setTestData(`{
  "status": "approved",
  "customer_email": "cliente@example.com",
  "amount": "97.00",
  "transaction_id": "test_123456",
  "product_id": "339591"
}`)}
              className="w-full justify-start"
            >
              Estrutura Padrão (customer_email, amount)
            </Button>

            <Button
              variant="outline"
              onClick={() => setTestData(`{
  "status": "paid",
  "email": "user@test.com",
  "value": "97.00",
  "order_id": "order_789",
  "product_id": "339591"
}`)}
              className="w-full justify-start"
            >
              Estrutura Alternativa (email, value, order_id)
            </Button>

            <Button
              variant="outline"
              onClick={() => setTestData(`{
  "status": "completed",
  "buyer_email": "comprador@site.com",
  "total": "97.00",
  "id": "payment_456",
  "product_id": "339591"
}`)}
              className="w-full justify-start"
            >
              Estrutura Variante (buyer_email, total, id)
            </Button>

            <Button
              variant="outline"
              onClick={() => setTestData(`{
  "status": "approved",
  "client_email": "cliente@dominio.com",
  "price": "97.00",
  "payment_id": "pay_123",
  "product_id": "339591"
}`)}
              className="w-full justify-start"
            >
              Estrutura Cliente (client_email, price, payment_id)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>URLs do Webhook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>Webhook Principal:</strong>
              <code className="block bg-muted p-2 rounded text-sm break-all">
                https://maracujazeropragas.com/api/webhook-allpes
              </code>
            </div>
            <div>
              <strong>Debug Webhook:</strong>
              <code className="block bg-muted p-2 rounded text-sm break-all">
                https://maracujazeropragas.com/api/debug-allpes
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}