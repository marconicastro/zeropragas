'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, CreditCard, User, Mail, Phone } from 'lucide-react';
import { useGTM } from '@/hooks/useGTM';

// Schema de validação do formulário
const checkoutFormSchema = z.object({
  fullName: z.string()
    .min(3, 'Nome completo deve ter pelo menos 3 caracteres')
    .refine(
      (value) => {
        // Permitir letras, espaços e caracteres comuns em nomes
        return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(value.trim());
      },
      'Nome deve conter apenas letras, espaços, apóstrofos e hífens'
    ),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(14, 'Telefone deve ter formato completo (XX) XXXXX-XXXX')
    .refine(
      (value) => {
        const cleaned = value.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 11;
      },
      'Telefone deve ter 10 ou 11 dígitos'
    ),
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

interface PreCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CheckoutFormData) => void;
}

export default function PreCheckoutModal({ isOpen, onClose, onSubmit }: PreCheckoutModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { trackFormSubmit, trackCheckoutInitiated, trackButtonClick } = useGTM();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
  });

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length === 0) return value;
    
    const limitedCleaned = cleaned.substring(0, 11);
    
    if (limitedCleaned.length <= 2) {
      return `(${limitedCleaned}`;
    } else if (limitedCleaned.length <= 6) {
      const ddd = limitedCleaned.substring(0, 2);
      const firstPart = limitedCleaned.substring(2);
      return `(${ddd}) ${firstPart}`;
    } else if (limitedCleaned.length <= 10) {
      const ddd = limitedCleaned.substring(0, 2);
      const firstPart = limitedCleaned.substring(2, 6);
      const secondPart = limitedCleaned.substring(6);
      return `(${ddd}) ${firstPart}-${secondPart}`;
    } else {
      const ddd = limitedCleaned.substring(0, 2);
      const firstPart = limitedCleaned.substring(2, 7);
      const secondPart = limitedCleaned.substring(7);
      return `(${ddd}) ${firstPart}-${secondPart}`;
    }
  };

  // Handlers para formatação em tempo real
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setValue('phone', formatted);
  };

  const onFormSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    
    try {
      // Track de início de checkout
      trackCheckoutInitiated({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
      });
      
      // Track de envio de formulário
      trackFormSubmit('pre_checkout_form', {
        form_fields: ['fullName', 'email', 'phone'],
        has_phone: true,
      });
      
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetar formulário quando o modal fechar
  React.useEffect(() => {
    if (!isOpen) {
      reset();
    } else {
      // Track quando o modal é aberto
      trackButtonClick('Abrir Modal Checkout', 'pre_checkout_modal');
    }
  }, [isOpen, reset, trackButtonClick]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Shield className="w-6 h-6 text-green-600" />
            Finalize sua compra com segurança
          </DialogTitle>
          <DialogDescription className="text-base">
            Preencha seus dados para acessar o pagamento seguro e pré-preenchido
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Campo Nome Completo */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium">
              <User className="w-4 h-4" />
              Nome Completo *
            </Label>
            <Input
              id="fullName"
              placeholder="Ex: João Silva"
              {...register('fullName')}
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Campo E-mail */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
              <Mail className="w-4 h-4" />
              E-mail *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Campo Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
              <Phone className="w-4 h-4" />
              Telefone *
            </Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              {...register('phone')}
              onChange={handlePhoneChange}
              maxLength={15}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Botão de Envio */}
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg transition-all duration-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="animate-pulse">Processando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                IR PARA O PAGAMENTO SEGURO
              </div>
            )}
          </Button>

          {/* Selos de Segurança */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Shield className="w-3 h-3 text-green-600" />
              Pagamento Seguro
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <CreditCard className="w-3 h-3 text-blue-600" />
              Criptografia SSL
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}