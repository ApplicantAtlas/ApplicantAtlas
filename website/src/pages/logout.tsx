import { useEffect } from 'react';
import { useRouter } from 'next/router';

import AuthService from '@/services/AuthService';
import { ToastType, useToast } from '@/components/Toast/ToastContext';
import Metadata from '@/components/Metadata';

const LogoutPage = () => {
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    AuthService.logout();
    showToast("You've been logged out! Please log back in", ToastType.Warning);
    router.push('/');
  }, [router, showToast]);

  return (
    <>
      <Metadata title="ApplicantAtlas | Logout" />
      <p>Logging out...</p>
    </>
  );
};

export default LogoutPage;
