/**
 * Hook para usar o contexto de Toast
 * Compatível com a API do ToastContext
 */

import { useToast as useToastContext } from '../contexts/ToastContext';

export function useToast() {
  return useToastContext();
}
