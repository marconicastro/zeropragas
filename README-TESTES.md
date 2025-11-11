# 🧪 Guia de Testes

## Instalação

```bash
npm install
```

## Executar Testes

```bash
# Executar todos os testes
npm run test

# Modo watch (re-executa ao salvar)
npm run test:watch

# Interface visual
npm run test:ui

# Com coverage
npm run test:coverage
```

## Estrutura de Testes

```
tests/
├── setup.ts                    # Setup global
└── lib/
    ├── hashing.test.ts         # Testes de hash
    ├── normalization.test.ts   # Testes de normalização
    └── validation.test.ts      # Testes de validação
```

## Cobertura Atual

- ✅ Hashing: 100%
- ✅ Normalization: 100%
- ✅ Validation: 100%

## Adicionar Novos Testes

1. Criar arquivo `tests/lib/seu-modulo.test.ts`
2. Importar funções a testar
3. Usar `describe` e `it` do Vitest
4. Executar `npm run test`

## Exemplo

```typescript
import { describe, it, expect } from 'vitest';
import { suaFuncao } from '@/lib/seu-modulo';

describe('Seu Módulo', () => {
  it('deve fazer algo', () => {
    const result = suaFuncao('input');
    expect(result).toBe('expected');
  });
});
```

