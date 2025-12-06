'use client';

import { useEffect, useCallback } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

// This component is responsible for listening to Firestore permission errors
// and displaying them in a toast notification during development.
export function FirebaseErrorListener() {
  const { toast } = useToast();

  const handleError = useCallback(
    (error: FirestorePermissionError) => {
      // In a production environment, you might want to log this to a service
      // like Sentry or log it to the console.
      if (process.env.NODE_ENV !== 'development') {
        console.error('Firestore Permission Error:', error.message);
        return;
      }
      
      // During development, we show a detailed toast.
      toast({
        variant: 'destructive',
        title: 'Firestore Security Rule Error',
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{error.toString()}</code>
          </pre>
        ),
        duration: 20000,
      });
    },
    [toast]
  );

  useEffect(() => {
    // Subscribe to the 'permission-error' event
    errorEmitter.on('permission-error', handleError);

    // Clean up the listener when the component unmounts
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [handleError]);

  // This component does not render anything to the DOM
  return null;
}
