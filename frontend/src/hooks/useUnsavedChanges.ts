import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface UseUnsavedChangesOptions {
  hasUnsavedChanges: boolean;
  message?: string;
  onSave?: () => Promise<void> | void;
  onDiscard?: () => void;
}

export const useUnsavedChanges = ({
  hasUnsavedChanges,
  message = 'You have unsaved changes. Are you sure you want to leave?',
  onSave,
  onDiscard
}: UseUnsavedChangesOptions) => {
  const navigate = useNavigate();
  const savedNavigateRef = useRef(navigate);
  const pendingLocationRef = useRef<string | null>(null);

  // Block navigation when there are unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  // Handle navigation blocking
  useEffect(() => {
    if (blocker.state === 'blocked') {
      pendingLocationRef.current = blocker.location.pathname;
      
      const handleConfirm = async () => {
        if (onSave) {
          try {
            await onSave();
            toast.success('Changes saved successfully');
            blocker.proceed?.();
          } catch (error) {
            toast.error('Failed to save changes. Please try again.');
            console.error('Save error:', error);
          }
        } else {
          blocker.proceed?.();
        }
      };

      const handleDiscard = () => {
        if (onDiscard) {
          onDiscard();
        }
        blocker.proceed?.();
      };

      const handleCancel = () => {
        blocker.reset?.();
      };

      // Show confirmation dialog
      if (window.confirm(message)) {
        if (onSave) {
          handleConfirm();
        } else {
          handleDiscard();
        }
      } else {
        handleCancel();
      }
    }
  }, [blocker, hasUnsavedChanges, message, onSave, onDiscard]);

  // Block page refresh/close when there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, message]);

  // Safe navigation function
  const safeNavigate = useCallback((to: string, options?: { replace?: boolean }) => {
    if (hasUnsavedChanges) {
              if (window.confirm(message)) {
          if (onSave) {
            const result = onSave();
            if (result && typeof result.then === 'function') {
              result.then(() => {
                savedNavigateRef.current(to, options);
              }).catch((error) => {
                toast.error('Failed to save changes. Please try again.');
                console.error('Save error:', error);
              });
            } else {
              savedNavigateRef.current(to, options);
            }
          } else {
            savedNavigateRef.current(to, options);
          }
        }
    } else {
      savedNavigateRef.current(to, options);
    }
  }, [hasUnsavedChanges, message, onSave]);

  return {
    safeNavigate,
    isBlocked: blocker.state === 'blocked',
    resetBlocker: blocker.reset,
    proceedBlocker: blocker.proceed
  };
}; 