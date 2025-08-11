import { useToastContext } from '../contexts/ToastContext';

/**
 * Hook for displaying toast notifications
 * 
 * @example
 * ```typescript
 * const toast = useToast();
 * 
 * const handleSuccess = () => {
 *   toast.success('Operation completed successfully');
 * };
 * 
 * const handleError = () => {
 *   toast.error('Something went wrong');
 * };
 * ```
 */
export const useToast = () => {
  const { showToast } = useToastContext();

  return {
    /**
     * Show a success toast notification
     * @param message - The message to display
     */
    success: (message: string) => showToast(message, 'success'),
    
    /**
     * Show an error toast notification
     * @param message - The message to display
     */
    error: (message: string) => showToast(message, 'error'),
  };
};
