import { useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthService from '@/services/AuthService';

const LogoutPage = () => {
    const router = useRouter();

    useEffect(() => {
        AuthService.logout()
        router.push('/');
    }, [router]);

    return (
        <div>
            <p>Logging out...</p>
        </div>
    );
};

export default LogoutPage;
