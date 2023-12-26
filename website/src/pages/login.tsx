import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import type { Metadata } from 'next';
import AuthService from '@/services/AuthService';
import { eventEmitter } from '@/events/EventEmitter';
import { useRouter } from 'next/router';
import FormBuilder from '@/components/FormBuilder/FormBuilder';
import { FormStructure } from '@/types/models/FormBuilder';
import { User } from '@/types/models/User';

export const metadata: Metadata = {
  title: 'ApplicantAtlas',
  description: 'ApplicantAtlas',
};

const LoginPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (AuthService.isAuth()) {
      router.push('/user/dashboard');
    }
  }, [router]);

  const loginFormStructure: FormStructure = {
    attrs: [
      {
        question: 'Email',
        type: 'text',
        key: 'email',
        required: true,
        additionalValidation: {
          isEmail: {
            isEmail: true,
          },
        },
      },
      {
        question: 'Password',
        type: 'text',
        key: 'password',
        required: true,
        additionalOptions: {
          isPassword: true,
        }
      },
    ],
  };

  const handleSubmit = (formData: Record<string, any>) => {
    const { email, password } = formData;
    AuthService.login({ email, password } as User)
      .then(() => {
        eventEmitter.emit('success', 'Successfully logged in!');
        router.push('/user/dashboard');
      })
      .catch((err) => {
        if (err.response) {
          eventEmitter.emit('apiError', err.response.data.error);
        }
      });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Head>
        <title>Login</title>
      </Head>

      <div className="w-full max-w-xs">
        <FormBuilder formStructure={loginFormStructure} submissionFunction={handleSubmit} buttonText='Login' />
        <Link href="/register">
          <div className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 cursor-pointer">
            Sign Up
          </div>
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
