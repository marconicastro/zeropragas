'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Send, TestTube } from 'lucide-react';

export default function WebhookTestPage() {
  const [testData, setTestData] = useState({
    status: 'approved',
    customer_email: 'teste@exemplo.com',
    customer_phone: '+5511999999999',
    amount: 39.90,
    transaction_id: 'TEST_' + Date.now(),
    product_id: 'hacr962',
    payment_method: 'credit_card'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string | number) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testWebhook = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Enviando teste para webhook:', testData);

      const response = await fetch('/api/webhook-allpes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const responseData = await response.json();
      console.log('📥 Resposta do webhook:', responseData);

      setResult({
        status: response.status,
        data: responseData,
        success: response.ok
      });

    } catch (err) {
      console.error('❌ Erro no teste:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const testWebhookGet = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/webhook-allpes');
      const responseData = await response.json();

      setResult({
        status: response.status,
        data: responseData,
        success: response.ok
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Teste Webhook Allpes
          </h1>
          <p className="text-gray-600">
            Teste o webhook que recebe dados da Allpes e envia Purchase Events para Meta
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuração do Teste */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Configuração do Teste
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full p-2 border rounded"
                  value={testData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <Label htmlFor="email">Email do Cliente</Label>
                <Input
                  id="email"
                  type="email"
                  value={testData.customer_email}
                  onChange={(e) => handleInputChange('customer_email', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone do Cliente</Label>
                <Input
                  id="phone"
                  value={testData.customer_phone}
                  onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={testData.amount}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="transaction_id">ID da Transação</Label>
                <Input
                  id="transaction_id"
                  value={testData.transaction_id}
                  onChange={(e) => handleInputChange('transaction_id', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="product_id">ID do Produto</Label>
                <Input
                  id="product_id"
                  value={testData.product_id}
                  onChange={(e) => handleInputChange('product_id', e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={testWebhook}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Testar POST
                </Button>

                <Button
                  onClick={testWebhookGet}
                  disabled={isLoading}
                  variant="outline"
                >
                  Testar GET
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="ml-2">Testando webhook...</span>
                </div>
              )}

              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Erro:</strong> {error}
                  </AlertDescription>
                </Alert>
              )}

              {result && (
                <div className="space-y-4">
                  <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                      <strong>Status:</strong> {result.status}
                      {result.success ? ' - Sucesso!' : ' - Erro'}
                    </AlertDescription>
                  </Alert>

                  <div>
                    <h4 className="font-semibold mb-2">Resposta Completa:</h4>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {!isLoading && !error && !result && (
                <div className="text-center py-8 text-gray-500">
                  <TestTube className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Preencha os dados e clique em "Testar POST" para enviar um evento de teste</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instruções */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📋 Instruções de Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <strong>1. Configurar na Allpes:</strong>
                <p className="text-gray-600 ml-4">
                  URL: <code className="bg-gray-100 px-2 py-1 rounded">https://maracujazeropragas.com/api/webhook-allpes</code><br/>
                  Método: <code className="bg-gray-100 px-2 py-1 rounded">POST</code>
                </p>
              </div>

              <div>
                <strong>2. Campos esperados da Allpes:</strong>
                <ul className="text-gray-600 ml-4 list-disc">
                  <li><code>status</code> - Status do pagamento (approved/paid)</li>
                  <li><code>customer_email</code> - Email do cliente</li>
                  <li><code>customer_phone</code> - Telefone do cliente</li>
                  <li><code>amount</code> - Valor da compra</li>
                  <li><code>transaction_id</code> - ID da transação</li>
                  <li><code>product_id</code> - ID do produto</li>
                </ul>
              </div>

              <div>
                <strong>3. O que o webhook faz:</strong>
                <ul className="text-gray-600 ml-4 list-disc">
                  <li>Recebe dados da Allpes</li>
                  <li>Valida pagamento aprovado</li>
                  <li>Recupera dados persistidos do usuário</li>
                  <li>Enriquece com 40+ parâmetros</li>
                  <li>Envia Purchase Event para Meta</li>
                  <li>Retorna confirmação</li>
                </ul>
              </div>

              <div>
                <strong>4. Logs:</strong>
                <p className="text-gray-600 ml-4">
                  Todos os eventos são logados no console. Verifique os logs do servidor para debug.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}