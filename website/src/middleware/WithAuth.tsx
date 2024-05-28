import React, {
  useEffect,
  useState,
  ComponentType,
  FC,
  PropsWithChildren,
} from 'react';
import { useRouter } from 'next/router';

import { useToast, ToastType } from '@/components/Toast/ToastContext';
import LoadingOverlay from '@/components/Loading/LoadingOverlay';

function withAuth<P>(
  WrappedComponent: ComponentType<P>
): FC<PropsWithChildren<P>> {
  const WithAuth: FC<PropsWithChildren<P>> = (props: PropsWithChildren<P>) => {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem('token');

      if (!token) {
        // Redirect to login if not authenticated
        showToast(
          'You must be logged in to view that page, please login.',
          ToastType.Error
        );
        router.push('/login');
      } else {
        setLoading(false);
      }
    }, [router]);

    if (loading) {
      return <LoadingOverlay />;
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuth;
}

export default withAuth;
