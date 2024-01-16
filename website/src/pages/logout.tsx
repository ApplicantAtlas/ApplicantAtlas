import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthService from '@/services/AuthService';
import { useRouter } from 'next/router';

const LogoutPage = () => {
    const [isLoggedOut, setIsLoggedOut] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
                router.push('/');
            }, 3000);
        return () => clearTimeout(timer);
    }, [router]);

    useEffect(() => {
        if (AuthService.isAuth()) {
            handleLogout();
        } else {
            setIsLoggedOut(true);
        }
    }, []);

    const handleLogout = async () => {
        await AuthService.logout();
        setIsLoggedOut(true);
    };

    if (isLoggedOut) {
        return (
            <div>
                <p>You have been logged out. Redirecting you to the home page, or click below.</p>
                <Link href="/">
                    <span>Go to Home</span>
                </Link>
            </div>
        );
    }

    return (
        <p>Logging you out...</p>
    );
};

export default LogoutPage;
