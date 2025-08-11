import { useConfirmContext } from '../contexts/ConfirmContext';

/**
 * Hook for displaying confirmation dialogs
 * 
 * @example
 * ```typescript
 * const confirm = useConfirm();
 * 
 * const handleDelete = () => {
 *   confirm.show({
 *     title: 'Delete Article',
 *     message: 'Are you sure you want to delete this article? This action cannot be undone.',
 *     variant: 'danger',
 *     confirmText: 'Delete',
 *     onConfirm: () => {
 *       // Delete logic here
 *     }
 *   });
 * };
 * ```
 */
export const useConfirm = () => {
  const { showConfirm } = useConfirmContext();

  return {
    /**
     * Show a confirmation dialog
     * @param options - Configuration for the confirmation dialog
     */
    show: showConfirm,
    
    /**
     * Convenience method for delete confirmations
     * @param itemName - Name of the item being deleted
     * @param onConfirm - Function to call when confirmed
     */
    delete: (itemName: string, onConfirm: () => void | Promise<void>) => {
      showConfirm({
        title: 'Confirm Delete',
        message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
        variant: 'danger',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        onConfirm,
      });
    },
    
    /**
     * Convenience method for generic destructive actions
     * @param title - Title of the confirmation
     * @param message - Message to display
     * @param onConfirm - Function to call when confirmed
     */
    danger: (title: string, message: string, onConfirm: () => void | Promise<void>) => {
      showConfirm({
        title,
        message,
        variant: 'danger',
        confirmText: 'Continue',
        cancelText: 'Cancel',
        onConfirm,
      });
    },
  };
};
